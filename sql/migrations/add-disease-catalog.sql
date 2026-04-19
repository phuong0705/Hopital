USE QuanLyKhamChuaBenhNoiTru;
GO

IF OBJECT_ID(N'DiseaseCatalog', N'U') IS NULL
BEGIN
  CREATE TABLE DiseaseCatalog (
    disease_id INT IDENTITY(1,1) PRIMARY KEY,
    disease_code VARCHAR(30) NOT NULL UNIQUE,
    icd10_code VARCHAR(20) NOT NULL,
    disease_name NVARCHAR(180) NOT NULL,
    specialty NVARCHAR(150) NOT NULL,
    severity_level NVARCHAR(30) NOT NULL DEFAULT N'Trung bình',
    common_symptoms NVARCHAR(1200),
    suggested_tests NVARCHAR(1000),
    recommended_medicines NVARCHAR(1200),
    clinical_guidance NVARCHAR(1200),
    contraindications NVARCHAR(1000),
    description NVARCHAR(1000),
    status NVARCHAR(30) NOT NULL DEFAULT N'Đang sử dụng',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2
  );
END;
GO

IF COL_LENGTH('DiseaseCatalog', 'common_symptoms') IS NULL
  ALTER TABLE DiseaseCatalog ADD common_symptoms NVARCHAR(1200);
GO

IF COL_LENGTH('DiseaseCatalog', 'suggested_tests') IS NULL
  ALTER TABLE DiseaseCatalog ADD suggested_tests NVARCHAR(1000);
GO

IF COL_LENGTH('DiseaseCatalog', 'recommended_medicines') IS NULL
  ALTER TABLE DiseaseCatalog ADD recommended_medicines NVARCHAR(1200);
GO

IF COL_LENGTH('DiseaseCatalog', 'clinical_guidance') IS NULL
  ALTER TABLE DiseaseCatalog ADD clinical_guidance NVARCHAR(1200);
GO

IF COL_LENGTH('DiseaseCatalog', 'contraindications') IS NULL
   AND COL_LENGTH('DiseaseCatalog', 'contraindicatications') IS NOT NULL
BEGIN
  EXEC sp_rename 'DiseaseCatalog.contraindicatications', 'contraindications', 'COLUMN';
END;
GO

IF COL_LENGTH('DiseaseCatalog', 'contraindications') IS NULL
  ALTER TABLE DiseaseCatalog ADD contraindications NVARCHAR(1000);
GO

IF NOT EXISTS (SELECT 1 FROM DiseaseCatalog)
BEGIN
  INSERT INTO DiseaseCatalog (
    disease_code, icd10_code, disease_name, specialty, severity_level,
    common_symptoms, suggested_tests, recommended_medicines, clinical_guidance,
    contraindications, description, status
  )
  VALUES
  ('BENH001', 'I10', N'Tăng huyết áp nguyên phát', N'Tim mạch', N'Trung bình',
   N'Đau đầu vùng chẩm; chóng mặt; hồi hộp; có thể không triệu chứng; huyết áp đo nhiều lần tăng.',
   N'Đo huyết áp chuẩn nhiều thời điểm; điện tim; creatinin/eGFR; điện giải đồ; đường huyết; lipid máu; tổng phân tích nước tiểu.',
   N'Amlodipine; Losartan hoặc Telmisartan; Hydrochlorothiazide/Indapamide khi phù hợp; phối hợp thuốc nếu chưa đạt mục tiêu.',
   N'Đánh giá nguy cơ tim mạch, tổn thương cơ quan đích và bệnh kèm. Theo dõi huyết áp tại giường, ăn giảm muối, điều chỉnh liều theo đáp ứng.',
   N'Tránh tự phối hợp nhiều thuốc hạ áp gây tụt huyết áp. Thận trọng ACEI/ARB ở phụ nữ có thai, hẹp động mạch thận, tăng kali máu.',
   N'Bệnh mạn tính cần theo dõi lâu dài, kiểm soát yếu tố nguy cơ tim mạch.', N'Đang sử dụng'),
  ('BENH002', 'E11', N'Đái tháo đường type 2', N'Nội tổng hợp', N'Cao',
   N'Khát nhiều; tiểu nhiều; sụt cân; mệt mỏi; nhìn mờ; vết thương lâu lành; có thể phát hiện qua xét nghiệm.',
   N'Glucose máu; HbA1c; ceton khi nghi nhiễm toan; creatinin/eGFR; lipid máu; tổng phân tích nước tiểu; microalbumin niệu.',
   N'Metformin nếu không chống chỉ định; insulin khi tăng đường huyết nặng/nhiễm trùng/phẫu thuật; cân nhắc SGLT2 hoặc GLP-1 theo bệnh kèm.',
   N'Kiểm soát đường huyết theo mục tiêu cá thể hóa, theo dõi hạ đường huyết, tư vấn ăn uống và vận động. Nội trú cần theo dõi glucose mao mạch.',
   N'Tránh Metformin khi suy thận nặng hoặc thiếu oxy mô. Theo dõi hạ đường huyết khi dùng insulin/sulfonylurea.',
   N'Ưu tiên đánh giá biến chứng cấp và bệnh lý kèm khi nhập viện.', N'Đang sử dụng'),
  ('BENH003', 'J18', N'Viêm phổi không xác định tác nhân', N'Hô hấp', N'Cao',
   N'Sốt; ho đờm; khó thở; đau ngực kiểu màng phổi; SpO2 giảm; ran phổi; mệt nhiều ở người cao tuổi.',
   N'Công thức máu; CRP/Procalcitonin khi cần; X-quang phổi; cấy máu/cấy đờm trước kháng sinh nếu nặng; khí máu khi suy hô hấp.',
   N'Ceftriaxone hoặc Ampicillin/Sulbactam; phối hợp Azithromycin khi nghi tác nhân không điển hình; điều chỉnh theo kháng sinh đồ.',
   N'Đánh giá mức độ nặng, nhu cầu oxy, nguy cơ nhiễm khuẩn bệnh viện. Theo dõi SpO2, nhịp thở, nhiệt độ và đáp ứng sau 48-72 giờ.',
   N'Tránh lạm dụng kháng sinh phổ rộng khi chưa có chỉ định. Hiệu chỉnh liều theo chức năng thận và tiền sử dị ứng.',
   N'Cần xử trí sớm nếu có suy hô hấp, tụt huyết áp hoặc rối loạn ý thức.', N'Đang sử dụng');
END;
GO
