USE QuanLyKhamChuaBenhNoiTru;
GO

CREATE TABLE FollowUpBookings (
  booking_id INT IDENTITY(1,1) PRIMARY KEY,
  patient_id INT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  department_id INT NOT NULL,
  doctor_id INT NULL,
  reason NVARCHAR(500),
  status NVARCHAR(50) NOT NULL DEFAULT N'Chờ xác nhận',
  created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_FollowUpBookings_Patients FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
  CONSTRAINT FK_FollowUpBookings_Departments FOREIGN KEY (department_id) REFERENCES Departments(department_id),
  CONSTRAINT FK_FollowUpBookings_Doctors FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);
GO
