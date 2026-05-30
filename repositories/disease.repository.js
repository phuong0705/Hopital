const { query, execute } = require('./base.repository');

async function ensureDiseaseCatalog() {
  await execute(`
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
  `);

  await execute(`
    IF COL_LENGTH('DiseaseCatalog', 'contraindications') IS NULL
       AND COL_LENGTH('DiseaseCatalog', 'contraindicatications') IS NOT NULL
    BEGIN
      EXEC sp_rename 'DiseaseCatalog.contraindicatications', 'contraindications', 'COLUMN';
    END;
  `);

  const columns = [
    ['common_symptoms', 'NVARCHAR(1200)'],
    ['suggested_tests', 'NVARCHAR(1000)'],
    ['recommended_medicines', 'NVARCHAR(1200)'],
    ['clinical_guidance', 'NVARCHAR(1200)'],
    ['contraindications', 'NVARCHAR(1000)'],
    ['description', 'NVARCHAR(1000)'],
    ['updated_at', 'DATETIME2']
  ];

  for (const [name, type] of columns) {
    await execute(`
      IF COL_LENGTH('DiseaseCatalog', '${name}') IS NULL
      BEGIN
        ALTER TABLE DiseaseCatalog ADD ${name} ${type};
      END;
    `);
  }

  await execute(`
    IF NOT EXISTS (SELECT 1 FROM DiseaseCatalog)
    BEGIN
      INSERT INTO DiseaseCatalog (
        disease_code, icd10_code, disease_name, specialty, severity_level,
        common_symptoms, suggested_tests, recommended_medicines, clinical_guidance,
        contraindications, description, status
      )
      VALUES
      (
        'BENH001', 'I10', N'Tăng huyết áp nguyên phát', N'Tim mạch', N'Trung bình',
        N'Đau đầu vùng chẩm; chóng mặt; hồi hộp; có thể không triệu chứng; huyết áp đo nhiều lần tăng.',
        N'Đo huyết áp chuẩn nhiều thời điểm; điện tim; creatinin/eGFR; điện giải đồ; đường huyết; lipid máu; tổng phân tích nước tiểu.',
        N'Amlodipine; Losartan hoặc Telmisartan; Hydrochlorothiazide/Indapamide khi phù hợp; phối hợp thuốc nếu chưa đạt mục tiêu.',
        N'Đánh giá nguy cơ tim mạch, tổn thương cơ quan đích và bệnh kèm. Theo dõi huyết áp tại giường, ăn giảm muối, điều chỉnh liều theo đáp ứng.',
        N'Tránh tự phối hợp nhiều thuốc hạ áp gây tụt huyết áp. Thận trọng ACEI/ARB ở phụ nữ có thai, hẹp động mạch thận, tăng kali máu.',
        N'Bệnh mạn tính cần theo dõi lâu dài, kiểm soát yếu tố nguy cơ tim mạch.',
        N'Đang sử dụng'
      ),
      (
        'BENH002', 'E11', N'Đái tháo đường type 2', N'Nội tổng hợp', N'Cao',
        N'Khát nhiều; tiểu nhiều; sụt cân; mệt mỏi; nhìn mờ; vết thương lâu lành; có thể phát hiện qua xét nghiệm.',
        N'Glucose máu; HbA1c; ceton khi nghi nhiễm toan; creatinin/eGFR; lipid máu; tổng phân tích nước tiểu; microalbumin niệu.',
        N'Metformin nếu không chống chỉ định; insulin khi tăng đường huyết nặng/nhiễm trùng/phẫu thuật; cân nhắc SGLT2 hoặc GLP-1 theo bệnh kèm.',
        N'Kiểm soát đường huyết theo mục tiêu cá thể hóa, theo dõi hạ đường huyết, tư vấn ăn uống và vận động. Nội trú cần theo dõi glucose mao mạch.',
        N'Tránh Metformin khi suy thận nặng hoặc thiếu oxy mô. Theo dõi hạ đường huyết khi dùng insulin/sulfonylurea.',
        N'Ưu tiên đánh giá biến chứng cấp và bệnh lý kèm khi nhập viện.',
        N'Đang sử dụng'
      ),
      (
        'BENH003', 'J18', N'Viêm phổi không xác định tác nhân', N'Hô hấp', N'Cao',
        N'Sốt; ho đờm; khó thở; đau ngực kiểu màng phổi; SpO2 giảm; ran phổi; mệt nhiều ở người cao tuổi.',
        N'Công thức máu; CRP/Procalcitonin khi cần; X-quang phổi; cấy máu/cấy đờm trước kháng sinh nếu nặng; khí máu khi suy hô hấp.',
        N'Ceftriaxone hoặc Ampicillin/Sulbactam; phối hợp Azithromycin khi nghi tác nhân không điển hình; điều chỉnh theo kháng sinh đồ.',
        N'Đánh giá mức độ nặng, nhu cầu oxy, nguy cơ nhiễm khuẩn bệnh viện. Theo dõi SpO2, nhịp thở, nhiệt độ và đáp ứng sau 48-72 giờ.',
        N'Tránh lạm dụng kháng sinh phổ rộng khi chưa có chỉ định. Hiệu chỉnh liều theo chức năng thận và tiền sử dị ứng.',
        N'Cần xử trí sớm nếu có suy hô hấp, tụt huyết áp hoặc rối loạn ý thức.',
        N'Đang sử dụng'
      ),
      (
        'BENH004', 'K35', N'Viêm ruột thừa cấp', N'Ngoại tổng hợp', N'Cao',
        N'Đau bụng quanh rốn chuyển hố chậu phải; buồn nôn; sốt nhẹ; phản ứng thành bụng; đau tăng khi vận động.',
        N'Công thức máu; CRP; siêu âm bụng; CT bụng khi chẩn đoán chưa rõ; đánh giá tiền phẫu.',
        N'Giảm đau phù hợp; Ceftriaxone phối hợp Metronidazole hoặc Cefoxitin trước mổ theo phác đồ; dịch truyền khi cần.',
        N'Nhịn ăn, hội chẩn ngoại, đánh giá chỉ định phẫu thuật. Theo dõi dấu hiệu viêm phúc mạc hoặc áp xe ruột thừa.',
        N'Không trì hoãn phẫu thuật khi có dấu hiệu thủng/viêm phúc mạc. Tránh dùng thuốc che lấp triệu chứng khi chưa đánh giá ngoại khoa.',
        N'Bệnh ngoại khoa cấp, cần theo dõi sát diễn biến đau bụng.',
        N'Đang sử dụng'
      ),
      (
        'BENH005', 'N39', N'Nhiễm khuẩn đường tiết niệu', N'Nội tổng hợp', N'Trung bình',
        N'Tiểu buốt; tiểu rắt; đau hạ vị; nước tiểu đục/hôi; sốt hoặc đau hông lưng nếu viêm thận bể thận.',
        N'Tổng phân tích nước tiểu; cấy nước tiểu trước kháng sinh nếu tái phát/nặng; công thức máu; creatinin/eGFR; siêu âm tiết niệu khi nghi tắc nghẽn.',
        N'Nitrofurantoin hoặc Fosfomycin cho viêm bàng quang không biến chứng; Ceftriaxone/Fluoroquinolone theo chỉ định khi nhiễm trùng nặng.',
        N'Uống đủ nước nếu không chống chỉ định, theo dõi sốt và đau hông lưng. Điều chỉnh kháng sinh theo cấy nước tiểu.',
        N'Tránh Nitrofurantoin khi suy thận nặng. Thận trọng Fluoroquinolone ở người cao tuổi, nguy cơ gân và QT kéo dài.',
        N'Phân biệt viêm bàng quang đơn giản với nhiễm trùng tiết niệu biến chứng.',
        N'Đang sử dụng'
      ),
      (
        'BENH006', 'A09', N'Viêm dạ dày ruột nhiễm khuẩn', N'Tiêu hóa', N'Thấp',
        N'Tiêu chảy; đau quặn bụng; buồn nôn/nôn; sốt; dấu mất nước; phân nhầy máu nếu xâm lấn.',
        N'Điện giải đồ; ure/creatinin khi mất nước; xét nghiệm phân/cấy phân nếu nặng, kéo dài hoặc có máu; công thức máu.',
        N'Oresol/dịch truyền bù nước; kẽm ở trẻ em theo chỉ định; kháng sinh như Azithromycin hoặc Ciprofloxacin chỉ khi nghi nhiễm khuẩn xâm lấn/nặng.',
        N'Ưu tiên bù nước và điện giải, theo dõi dấu mất nước. Ăn nhẹ, tránh thuốc cầm tiêu chảy khi sốt cao hoặc phân máu.',
        N'Tránh Loperamide khi tiêu chảy xâm lấn, sốt cao hoặc phân máu. Hiệu chỉnh dịch truyền ở bệnh nhân tim/thận.',
        N'Đa số điều trị hỗ trợ, kháng sinh cần cân nhắc theo mức độ và nguyên nhân.',
        N'Đang sử dụng'
      );
    END;
  `);
}

async function getDiseases() {
  await ensureDiseaseCatalog();

  return query(`
    SELECT
      disease_id AS diseaseId,
      disease_code AS diseaseCode,
      icd10_code AS icd10Code,
      disease_name AS diseaseName,
      specialty,
      severity_level AS severityLevel,
      common_symptoms AS commonSymptoms,
      suggested_tests AS suggestedTests,
      recommended_medicines AS recommendedMedicines,
      clinical_guidance AS clinicalGuidance,
      contraindications,
      description,
      status,
      created_at AS createdAt
    FROM DiseaseCatalog
    ORDER BY disease_name
  `);
}

async function createDisease(data) {
  await ensureDiseaseCatalog();

  await execute(`
    INSERT INTO DiseaseCatalog (
      disease_code,
      icd10_code,
      disease_name,
      specialty,
      severity_level,
      common_symptoms,
      suggested_tests,
      recommended_medicines,
      clinical_guidance,
      contraindications,
      description,
      status
    )
    VALUES (
      @diseaseCode,
      @icd10Code,
      @diseaseName,
      @specialty,
      @severityLevel,
      NULLIF(@commonSymptoms, ''),
      NULLIF(@suggestedTests, ''),
      NULLIF(@recommendedMedicines, ''),
      NULLIF(@clinicalGuidance, ''),
      NULLIF(@contraindications, ''),
      NULLIF(@description, ''),
      @status
    )
  `, {
    diseaseCode: data.diseaseCode,
    icd10Code: data.icd10Code,
    diseaseName: data.diseaseName,
    specialty: data.specialty,
    severityLevel: data.severityLevel || 'Trung bình',
    commonSymptoms: data.commonSymptoms || '',
    suggestedTests: data.suggestedTests || '',
    recommendedMedicines: data.recommendedMedicines || '',
    clinicalGuidance: data.clinicalGuidance || '',
    contraindications: data.contraindications || '',
    description: data.description || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateDisease(diseaseId, data) {
  await ensureDiseaseCatalog();

  await execute(`
    UPDATE DiseaseCatalog
    SET disease_code = @diseaseCode,
      icd10_code = @icd10Code,
      disease_name = @diseaseName,
      specialty = @specialty,
      severity_level = @severityLevel,
      common_symptoms = NULLIF(@commonSymptoms, ''),
      suggested_tests = NULLIF(@suggestedTests, ''),
      recommended_medicines = NULLIF(@recommendedMedicines, ''),
      clinical_guidance = NULLIF(@clinicalGuidance, ''),
      contraindications = NULLIF(@contraindications, ''),
      description = NULLIF(@description, ''),
      status = @status,
      updated_at = SYSDATETIME()
    WHERE disease_id = @diseaseId
  `, {
    diseaseId: Number(diseaseId),
    diseaseCode: data.diseaseCode,
    icd10Code: data.icd10Code,
    diseaseName: data.diseaseName,
    specialty: data.specialty,
    severityLevel: data.severityLevel || 'Trung bình',
    commonSymptoms: data.commonSymptoms || '',
    suggestedTests: data.suggestedTests || '',
    recommendedMedicines: data.recommendedMedicines || '',
    clinicalGuidance: data.clinicalGuidance || '',
    contraindications: data.contraindications || '',
    description: data.description || '',
    status: data.status || 'Đang sử dụng'
  });
}

async function updateDiseaseStatus(diseaseId, status) {
  await ensureDiseaseCatalog();

  await execute(`
    UPDATE DiseaseCatalog
    SET status = @status,
        updated_at = SYSDATETIME()
    WHERE disease_id = @diseaseId
  `, {
    diseaseId: Number(diseaseId),
    status
  });
}

module.exports = {
  getDiseases,
  createDisease,
  updateDisease,
  updateDiseaseStatus
};
