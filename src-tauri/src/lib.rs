use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf};
use tauri::AppHandle;
use tauri_plugin_secure_storage::{OptionsRequest, SecureStorageExt};
use umya_spreadsheet::{reader, writer, Worksheet};

const DEFAULT_LOCAL_BASE: &str = "http://localhost:11434";
const DEFAULT_LOCAL_MODEL: &str = "llama3";
const DEFAULT_API_MODEL: &str = "gpt-4o";
const CREDENTIALS_KEY: &str = "legendtrack_ai_credentials";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Topic {
    id: String,
    epoch: Option<i32>,
    epoch_theme: String,
    track: String,
    track_title: String,
    topic_name: String,
    description: String,
    depth_target: String,
    current_depth: String,
    status: String,
    last_worked_on: String,
    example_project: String,
    concept_evidence: String,
    implementation_evidence: String,
    application_evidence: String,
    related_topic_ids: String,
    notes: String,
    resources: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Project {
    id: String,
    title: String,
    summary: String,
    topic_ids: String,
    status: String,
    start_date: String,
    end_date: String,
    outcomes: String,
    resources: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TrackerPayload {
    topics: Vec<Topic>,
    projects: Vec<Project>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TopicUpdatePayload {
    depth_target: Option<String>,
    current_depth: Option<String>,
    status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum AiModePreference {
    Api,
    Local,
}

impl Default for AiModePreference {
    fn default() -> Self {
        Self::Api
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AiCredentialsPayload {
    #[serde(default)]
    mode: AiModePreference,
    #[serde(default)]
    api_key: Option<String>,
    #[serde(default)]
    api_model: Option<String>,
    #[serde(default)]
    local_base: Option<String>,
    #[serde(default)]
    local_model: Option<String>,
    #[serde(default)]
    local_prompt: Option<String>,
}

impl Default for AiCredentialsPayload {
    fn default() -> Self {
        Self {
            mode: AiModePreference::Api,
            api_key: None,
            api_model: Some(DEFAULT_API_MODEL.to_string()),
            local_base: Some(DEFAULT_LOCAL_BASE.to_string()),
            local_model: Some(DEFAULT_LOCAL_MODEL.to_string()),
            local_prompt: None,
        }
    }
}

impl AiCredentialsPayload {
    fn normalize(mut self) -> Self {
        if let Some(val) = self.api_key.as_mut() {
            *val = val.trim().to_string();
            if val.is_empty() {
                self.api_key = None;
            }
        }
        if let Some(val) = self.api_model.as_mut() {
            *val = val.trim().to_string();
            if val.is_empty() {
                *val = DEFAULT_API_MODEL.to_string();
            }
        } else {
            self.api_model = Some(DEFAULT_API_MODEL.to_string());
        }
        if let Some(val) = self.local_base.as_mut() {
            *val = val.trim().to_string();
            if val.is_empty() {
                *val = DEFAULT_LOCAL_BASE.to_string();
            }
        } else {
            self.local_base = Some(DEFAULT_LOCAL_BASE.to_string());
        }
        if let Some(val) = self.local_model.as_mut() {
            *val = val.trim().to_string();
            if val.is_empty() {
                *val = DEFAULT_LOCAL_MODEL.to_string();
            }
        } else {
            self.local_model = Some(DEFAULT_LOCAL_MODEL.to_string());
        }
        if let Some(val) = self.local_prompt.as_mut() {
            *val = val.trim().to_string();
            if val.is_empty() {
                self.local_prompt = None;
            }
        }
        self
    }
}

fn clean(value: String) -> String {
    value.trim().to_string()
}

fn build_header_map(sheet: &Worksheet) -> HashMap<String, u32> {
    let mut map = HashMap::new();
    let highest_col = sheet.get_highest_column();
    for col in 1..=highest_col {
        let header = clean(sheet.get_value((col, 1)));
        if !header.is_empty() {
            map.insert(header, col);
        }
    }
    map
}

fn cell_value(sheet: &Worksheet, headers: &HashMap<String, u32>, header: &str, row: u32) -> String {
    headers
        .get(header)
        .map(|col| clean(sheet.get_value((*col, row))))
        .unwrap_or_default()
}

fn extract_topics(sheet: &Worksheet) -> Vec<Topic> {
    let headers = build_header_map(sheet);
    let highest_row = sheet.get_highest_row();
    let mut rows = Vec::new();

    let id_col = match headers.get("ID") {
        Some(col) => *col,
        None => return rows,
    };

    for row_idx in 2..=highest_row {
        let id = clean(sheet.get_value((id_col, row_idx)));
        if id.is_empty() {
            continue;
        }
        let epoch_raw = cell_value(sheet, &headers, "Epoch", row_idx);
        let epoch = epoch_raw.parse::<i32>().ok();
        rows.push(Topic {
            id,
            epoch,
            epoch_theme: cell_value(sheet, &headers, "Epoch Theme", row_idx),
            track: cell_value(sheet, &headers, "Track", row_idx),
            track_title: cell_value(sheet, &headers, "Track Title", row_idx),
            topic_name: cell_value(sheet, &headers, "Topic Name", row_idx),
            description: cell_value(sheet, &headers, "Description", row_idx),
            depth_target: cell_value(sheet, &headers, "Depth Target (L1-L4)", row_idx),
            current_depth: cell_value(sheet, &headers, "Current Depth", row_idx),
            status: cell_value(sheet, &headers, "Status", row_idx),
            last_worked_on: cell_value(sheet, &headers, "Last Worked On", row_idx),
            example_project: cell_value(sheet, &headers, "Example Project", row_idx),
            concept_evidence: cell_value(sheet, &headers, "Concept Evidence", row_idx),
            implementation_evidence: cell_value(
                sheet,
                &headers,
                "Implementation Evidence",
                row_idx,
            ),
            application_evidence: cell_value(sheet, &headers, "Application Evidence", row_idx),
            related_topic_ids: cell_value(sheet, &headers, "Related Topic IDs", row_idx),
            notes: cell_value(sheet, &headers, "Notes / Questions", row_idx),
            resources: cell_value(sheet, &headers, "Resources Used", row_idx),
        });
    }
    rows
}

fn extract_projects(sheet: &Worksheet) -> Vec<Project> {
    let headers = build_header_map(sheet);
    let highest_row = sheet.get_highest_row();
    let mut rows = Vec::new();

    let title_col = match headers
        .get("Project / Experiment")
        .or_else(|| headers.get("Project/Experiment"))
    {
        Some(col) => *col,
        None => return rows,
    };

    for row_idx in 2..=highest_row {
        let title = clean(sheet.get_value((title_col, row_idx)));
        if title.is_empty() {
            continue;
        }
        let id = {
            let raw = cell_value(sheet, &headers, "Project ID", row_idx);
            if raw.is_empty() {
                title.clone()
            } else {
                raw
            }
        };
        rows.push(Project {
            id,
            title,
            summary: cell_value(sheet, &headers, "Summary / Goal", row_idx),
            topic_ids: cell_value(sheet, &headers, "Topic IDs Covered", row_idx),
            status: cell_value(sheet, &headers, "Status", row_idx),
            start_date: cell_value(sheet, &headers, "Start Date", row_idx),
            end_date: cell_value(sheet, &headers, "End Date", row_idx),
            outcomes: cell_value(sheet, &headers, "Outcomes / Next Actions", row_idx),
            resources: cell_value(sheet, &headers, "Resources / Links", row_idx),
        });
    }
    rows.sort_by(|a, b| a.title.cmp(&b.title));
    rows
}

fn resolve_path(raw: &str) -> Result<PathBuf, String> {
    if raw.trim().is_empty() {
        return Err("No tracker file selected.".into());
    }
    Ok(PathBuf::from(raw))
}

fn credentials_request(data: Option<String>) -> OptionsRequest {
    OptionsRequest {
        prefixed_key: Some(CREDENTIALS_KEY.to_string()),
        data,
        sync: None,
        keychain_access: None,
    }
}

#[tauri::command]
fn load_tracker(path: String) -> Result<TrackerPayload, String> {
    let workbook = reader::xlsx::read(&resolve_path(&path)?).map_err(|err| err.to_string())?;
    let topics_sheet = workbook
        .get_sheet_by_name("Topics")
        .ok_or_else(|| "Sheet \"Topics\" not found.".to_string())?;
    let projects_sheet = workbook.get_sheet_by_name("Projects & Experiments");
    let topics = extract_topics(topics_sheet);
    let projects = projects_sheet.map(extract_projects).unwrap_or_default();
    Ok(TrackerPayload { topics, projects })
}

#[tauri::command]
fn update_topic(path: String, topic_id: String, payload: TopicUpdatePayload) -> Result<(), String> {
    let mut workbook = reader::xlsx::read(&resolve_path(&path)?).map_err(|err| err.to_string())?;
    let sheet = workbook
        .get_sheet_by_name_mut("Topics")
        .ok_or_else(|| "Sheet \"Topics\" not found.".to_string())?;
    let headers = build_header_map(sheet);
    let id_col = headers
        .get("ID")
        .copied()
        .ok_or_else(|| "ID column not found.".to_string())?;
    let highest_row = sheet.get_highest_row();
    let mut target_row = None;
    for row_idx in 2..=highest_row {
        if clean(sheet.get_value((id_col, row_idx))) == topic_id {
            target_row = Some(row_idx);
            break;
        }
    }

    let row = target_row.ok_or_else(|| format!("Topic {} not found.", topic_id))?;
    if let Some(new_value) = payload
        .depth_target
        .as_ref()
        .map(|v| v.trim())
        .filter(|v| !v.is_empty())
    {
        if let Some(col) = headers.get("Depth Target (L1-L4)") {
            sheet.get_cell_mut((*col, row)).set_value(new_value);
        }
    }
    if let Some(new_value) = payload
        .current_depth
        .as_ref()
        .map(|v| v.trim())
        .filter(|v| !v.is_empty())
    {
        if let Some(col) = headers.get("Current Depth") {
            sheet.get_cell_mut((*col, row)).set_value(new_value);
        }
    }
    if let Some(new_value) = payload
        .status
        .as_ref()
        .map(|v| v.trim())
        .filter(|v| !v.is_empty())
    {
        if let Some(col) = headers.get("Status") {
            sheet.get_cell_mut((*col, row)).set_value(new_value);
        }
    }

    writer::xlsx::write(&workbook, &resolve_path(&path)?).map_err(|err| err.to_string())
}

#[tauri::command]
fn get_ai_credentials(app: AppHandle) -> Result<AiCredentialsPayload, String> {
    let response = app
        .secure_storage()
        .get_item(app.clone(), credentials_request(None))
        .map_err(|err| err.to_string())?;
    if let Some(raw) = response.data {
        let parsed: AiCredentialsPayload = serde_json::from_str(&raw).unwrap_or_default();
        Ok(parsed.normalize())
    } else {
        Ok(AiCredentialsPayload::default())
    }
}

#[tauri::command]
fn save_ai_credentials(app: AppHandle, payload: AiCredentialsPayload) -> Result<(), String> {
    let normalized = payload.normalize();
    let data = serde_json::to_string(&normalized).map_err(|err| err.to_string())?;
    app.secure_storage()
        .set_item(app.clone(), credentials_request(Some(data)))
        .map_err(|err| err.to_string())
        .map(|_| ())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_secure_storage::init())
        .invoke_handler(tauri::generate_handler![
            load_tracker,
            update_topic,
            get_ai_credentials,
            save_ai_credentials
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
