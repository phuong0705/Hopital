USE QuanLyKhamChuaBenhNoiTru;
GO

ALTER TABLE Rooms ADD room_type NVARCHAR(50) DEFAULT N'Thường';
GO
ALTER TABLE Users ADD department_id INT;
GO
ALTER TABLE Users ADD CONSTRAINT FK_Users_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id);
GO

-- Update some existing rooms with types
UPDATE Rooms SET room_type = N'Cấp cứu' WHERE room_code LIKE '%CC%';
GO
UPDATE Rooms SET room_type = N'Hồi sức' WHERE room_code LIKE '%HS%';
GO

-- Assign the seed nurse to a department for testing
UPDATE Users SET department_id = 1 WHERE username = 'dieuduong';
GO
