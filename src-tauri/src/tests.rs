use super::*;
use umya_spreadsheet::Worksheet;

fn create_sheet_with_headers(headers: &[&str]) -> Worksheet {
    let mut sheet = Worksheet::default();
    for (i, header) in headers.iter().enumerate() {
        sheet.get_cell_mut((i as u32 + 1, 1)).set_value(*header);
    }
    sheet
}

#[test]
fn test_standard_extraction() {
    let mut sheet = create_sheet_with_headers(&["ID", "Topic Name", "Status"]);
    sheet.get_cell_mut((1, 2)).set_value("E1-A-1");
    sheet.get_cell_mut((2, 2)).set_value("Intro to Logic");
    sheet.get_cell_mut((3, 2)).set_value("Done");

    let topics = extract_topics(&sheet);
    assert_eq!(topics.len(), 1);
    assert_eq!(topics[0].id, "E1-A-1");
    assert_eq!(topics[0].topic_name, "Intro to Logic");
    assert_eq!(topics[0].status, "Done");
}

#[test]
fn test_missing_non_essential_columns() {
    // Missing 'Status' and 'Description'
    let mut sheet = create_sheet_with_headers(&["ID", "Topic Name"]);
    sheet.get_cell_mut((1, 2)).set_value("E1-B-1");
    sheet.get_cell_mut((2, 2)).set_value("Rust Basics");

    let topics = extract_topics(&sheet);
    assert_eq!(topics.len(), 1);
    assert_eq!(topics[0].topic_name, "Rust Basics");
    assert_eq!(topics[0].status, ""); // Should default to empty
}

#[test]
fn test_unicode_safety() {
    let mut sheet = create_sheet_with_headers(&["ID", "Topic Name", "Description"]);
    sheet.get_cell_mut((1, 2)).set_value("E2-C-5");
    sheet.get_cell_mut((2, 2)).set_value("The 👻 Protocol"); // Emoji
    sheet.get_cell_mut((3, 2)).set_value("Kansai Dialect: 関西弁"); // Japanese

    let topics = extract_topics(&sheet);
    assert_eq!(topics[0].topic_name, "The 👻 Protocol");
    assert_eq!(topics[0].description, "Kansai Dialect: 関西弁");
}

#[test]
fn test_weird_ids() {
    let mut sheet = create_sheet_with_headers(&["ID"]);
    sheet.get_cell_mut((1, 2)).set_value("E99-Ω-999"); // Greek letter in ID

    let topics = extract_topics(&sheet);
    assert_eq!(topics[0].id, "E99-Ω-999");
}

#[test]
fn test_missing_id_column() {
    // If ID column is missing, it should return empty list, not panic
    let sheet = create_sheet_with_headers(&["Topic Name", "Status"]);
    let topics = extract_topics(&sheet);
    assert_eq!(topics.len(), 0);
}

#[test]
fn test_empty_rows_skipped() {
    let mut sheet = create_sheet_with_headers(&["ID", "Topic Name"]);
    sheet.get_cell_mut((1, 2)).set_value("E1-A-1"); // Row 2
    // Row 3 is empty
    sheet.get_cell_mut((1, 4)).set_value("E1-A-2"); // Row 4

    let topics = extract_topics(&sheet);
    assert_eq!(topics.len(), 2);
    assert_eq!(topics[0].id, "E1-A-1");
    assert_eq!(topics[1].id, "E1-A-2");
}
