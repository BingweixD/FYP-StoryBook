CREATE TABLE pdfs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT,
    pdf BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
);
