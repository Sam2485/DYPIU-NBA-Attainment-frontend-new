 ## 1. Programme Attainment Master Consolidated Report (PDF & Excel)                                                                              
                                                                                                                                                   
  ### A. Download Master Excel (.xlsx)                                                                                                             
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-attainment/{programmeBatchId}/master/excel                                                                  
  • Query Params: masterProgrammeId (Optional)                                                                                                     
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet                                                            
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Programme_Attainment_Master.xlsx"                                             
                                                                                                                                                   
      • Body: Binary Excel Stream containing all sections:                                                                                         
          • Sheet 1: Cover & Summary                                                                                                               
          • Sheet 2: PO Average Mapping Matrix                                                                                                     
          • Sheet 3: PSO Average Mapping Matrix                                                                                                    
          • Sheet 4: Direct Attainment                                                                                                             
          • Sheet 5: Indirect Attainment (Exit Survey)                                                                                             
          • Sheet 6: Master Attainment (80-20 Weighted)                                                                                            
                                                                                                                                                   
                                                                                                                                                   
                                                                                                                                                   
  ### B. Download Master PDF (.pdf)                                                                                                                
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-attainment/{programmeBatchId}/master/pdf                                                                    
  • Query Params: masterProgrammeId (Optional)                                                                                                     
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf                                                                                                              
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Programme_Attainment_Master.pdf"                                              
                                                                                                                                                   
      • Body: Binary PDF Stream (Formatted in Landscape with Institutional Header, 2 Logos, Metadata Grid, and All Attainment Tables).             
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 2. Programme Attainment Section-Wise Reports (PDF & Excel)                                                                                    
                                                                                                                                                   
  Sections supported in URL path {section}:                                                                                                        
                                                                                                                                                   
  1. AVERAGE_MAPPING (or MAPPING)                                                                                                                  
  2. AVERAGE_DIRECT (or DIRECT)                                                                                                                    
  3. AVERAGE_INDIRECT (or INDIRECT)                                                                                                                
  4. OVERALL (or OVERALL_ATTAINMENT)                                                                                                               
                                                                                                                                                   
  ### A. Download Section Excel (.xlsx)                                                                                                            
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-attainment/{programmeBatchId}/section/{section}/excel                                                       
  • Example: GET /api/v1/reports/programme-attainment/batch-2021-25/section/AVERAGE_MAPPING/excel                                                  
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet                                                            
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Average_Mapping.xlsx"                                                         
                                                                                                                                                   
      • Body: Binary Excel file for the requested section.                                                                                         
                                                                                                                                                   
                                                                                                                                                   
  ### B. Download Section PDF (.pdf)                                                                                                               
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-attainment/{programmeBatchId}/section/{section}/pdf                                                         
  • Example: GET /api/v1/reports/programme-attainment/batch-2021-25/section/AVERAGE_MAPPING/pdf                                                    
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf                                                                                                              
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Average_Mapping.pdf"                                                          
                                                                                                                                                   
      • Body: Binary PDF file for the requested section.                                                                                           
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 3. Course Attainment Consolidated Report (PDF & Excel)                                                                                        
                                                                                                                                                   
  ### A. Download Course Attainment Excel (.xlsx)                                                                                                  
                                                                                                                                                   
  • URL: GET /api/v1/reports/course-attainment/{programmeBatchCourseId}/excel                                                                      
  • Example: GET /api/v1/reports/course-attainment/pbc-cs401-2024/excel                                                                            
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet                                                            
        Content-Disposition: attachment; filename="CS401_Course_Attainment_Report.xlsx"                                                            
                                                                                                                                                   
      • Body: Binary Excel Stream (Contains Table 1: Articulation Matrix, Table 2: Direct PO Contribution, Table 3: CO Attainment Breakdown).      
                                                                                                                                                   
                                                                                                                                                   
  ### B. Download Course Attainment PDF (.pdf)                                                                                                     
                                                                                                                                                   
  • URL: GET /api/v1/reports/course-attainment/{programmeBatchCourseId}/pdf                                                                        
  • Example: GET /api/v1/reports/course-attainment/pbc-cs401-2024/pdf                                                                              
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf                                                                                                              
        Content-Disposition: attachment; filename="CS401_Course_Attainment_Report.pdf"                                                             
                                                                                                                                                   
      • Body: Binary Landscape PDF Stream with Dual Logos, Metadata Block, Course Articulation Matrix, and Attainment Score tables.                
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 4. Programme Action Taken Report (ATR) (PDF & Excel)                                                                                          
                                                                                                                                                   
  ### A. Download Programme ATR Excel (.xlsx)                                                                                                      
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-atr/{programmeBatchId}/excel                                                                                
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet                                                            
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Programme_ATR.xlsx"                                                           
                                                                                                                                                   
      • Body: Binary Excel Stream.                                                                                                                 
                                                                                                                                                   
                                                                                                                                                   
  ### B. Download Programme ATR PDF (.pdf)                                                                                                         
                                                                                                                                                   
  • URL: GET /api/v1/reports/programme-atr/{programmeBatchId}/pdf                                                                                  
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf                                                                                                              
        Content-Disposition: attachment; filename="BTECH_CSE_2021_25_Programme_ATR.pdf"                                                            
                                                                                                                                                   
      • Body: Binary Portrait PDF Stream (Contains Programme Context, Target Attainment vs Actual Gaps, Proposed Remedial Actions, Action Timeline,
      and Sign-off Blocks).                                                                                                                        
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 5. Course Action Taken Report (ATR) (PDF & Excel)                                                                                             
                                                                                                                                                   
  ### A. Download Course ATR Excel (.xlsx)                                                                                                         
                                                                                                                                                   
  • URL: GET /api/v1/reports/course-atr/{programmeBatchCourseId}/excel                                                                             
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet                                                            
        Content-Disposition: attachment; filename="CS401_Course_ATR.xlsx"                                                                          
                                                                                                                                                   
      • Body: Binary Excel Stream.                                                                                                                 
                                                                                                                                                   
                                                                                                                                                   
  ### B. Download Course ATR PDF (.pdf)                                                                                                            
                                                                                                                                                   
  • URL: GET /api/v1/reports/course-atr/{programmeBatchCourseId}/pdf                                                                               
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf                                                                                                              
        Content-Disposition: attachment; filename="CS401_Course_ATR.pdf"                                                                           
                                                                                                                                                   
      • Body: Binary Portrait PDF Stream (Contains Course Information, CO Target vs Actual Attainment, Gap Analysis, Corrective Action Plan, and   
      Approval Signatures).                                                                                                                        
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 6. Direct Artifact Download by Artifact ID                                                                                                    
                                                                                                                                                   
  • URL: GET /api/v1/reports/artifacts/{artifactId}/download                                                                                       
  • Headers:                                                                                                                                       
    Authorization: Bearer <JWT_TOKEN>                                                                                                              
                                                                                                                                                   
  • Response (200 OK):                                                                                                                             
      • Headers:                                                                                                                                   
        Content-Type: application/pdf (or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)                                       
        Content-Disposition: attachment; filename="<original_filename>"                                                                            
        Content-Length: <file_size_bytes>                                                                                                          
                                                                                                                                                   
      • Body: Exact persisted binary file content.                                                                                                 
                                                                                                                                                   
  ──────                                                                                                                                           
  ## 7. Cryptographic Report Integrity Verification (SHA-256 + HMAC)                                                                               
                                                                                                                                                   
  • URL: POST /api/v1/reports/verify                                                                                                               
  • Content-Type: multipart/form-data                                                                                                              
  • Request Form-Data:                                                                                                                             
      • reportId: "rep-4a37b129-e85d-4f32-bb91-03091df284b1"                                                                                       
      • artifactType: "PDF" (or "EXCEL")                                                                                                           
      • file: <Binary File Upload>                                                                                                                 
  • Response (200 OK):                                                                                                                             
    {                                                                                                                                              
      "success": true,                                                                                                                             
      "message": "Report artifact integrity verified successfully. File is authentic and unchanged.",                                              
      "data": {                                                                                                                                    
        "reportId": "rep-4a37b129-e85d-4f32-bb91-03091df284b1",                                                                                    
        "artifactType": "PDF",                                                                                                                     
        "valid": true,                                                                                                                             
        "message": "Report artifact integrity verified successfully. File is authentic and unchanged.",                                            
        "computedSha256": "3a7bd28c89a08e1a129d5012e8b8c2d154fa91be7c919df51aa3902340248c8b",                                                      
        "expectedSha256": "3a7bd28c89a08e1a129d5012e8b8c2d154fa91be7c919df51aa3902340248c8b",                                                      
        "hmacValid": true,                                                                                                                         
        "verifiedAt": "2026-09-04T13:05:00.123+05:30"                                                                                              
      }                                                                                                                                            
    }  
       Phase 5.5 — Report Management API Audit & Implementation Report                                                                                 
  ──────                                                                                                                                           
  ### 1. APIs That Already Existed                                                                                                                 
                                                                                                                                                   
  The backend had full report-generation, rendering, and cryptographic verification implementations:                                               
                                                                                                                                                   
  • Programme Attainment Master Downloads: GET /api/v1/reports/programme-attainment/{programmeBatchId}/master/pdf & /excel                         
  • Programme Attainment Section Downloads: GET /api/v1/reports/programme-attainment/{programmeBatchId}/section/{section}/pdf & /excel             
  • Course Attainment Downloads: GET /api/v1/reports/course-attainment/{programmeBatchCourseId}/pdf & /excel                                       
  • Programme ATR Downloads: GET /api/v1/reports/programme-atr/{programmeBatchId}/pdf & /excel                                                     
  • Course ATR Downloads: GET /api/v1/reports/course-atr/{programmeBatchCourseId}/pdf & /excel                                                     
  • Direct Artifact Download: GET /api/v1/reports/artifacts/{artifactId}/download                                                                  
  • Cryptographic Verification: POST /api/v1/reports/verify                                                                                        
  ──────                                                                                                                                           
  ### 2. APIs That Were Missing (Identified Gaps)                                                                                                  
                                                                                                                                                   
  1. IQAC Institutional Template & Branding Management:                                                                                            
      • No REST endpoints existed to retrieve or update the common institution template and HeaderConfig (institution name, address, accreditation 
      text, theme colors).                                                                                                                         
  2. IQAC Logo / Asset Upload & Lifecycle Management:                                                                                              
      • No REST endpoints existed for IQAC to upload LEFT and RIGHT logos, stream raw image bytes for preview, list uploaded assets, or            
      delete/unlink logos from the header configuration.                                                                                           
  3. Generated Reports History & Listing:                                                                                                          
      • No REST endpoint existed for the UI to query historical generated reports with artifact summaries (PDF/Excel file IDs, sizes, checksums,   
      and generation metadata) without direct filesystem access.                                                                                   
                                                                                                                                                   
  ──────                                                                                                                                           
  ### 3. APIs Created                                                                                                                              
                                                                                                                                                   
   Category         │ Method          │ Path                                 │ Auth / Role     │ Description
  ──────────────────┼─────────────────┼──────────────────────────────────────┼─────────────────┼───────────────────────────────────────────────────
   Template         │ GET             │ /api/v1/reports/template             │ Authenticated   │ Get current institutional report template
   Template         │ PUT             │ /api/v1/reports/template             │ IQAC            │ Update institutional report template & branding
   Template         │ GET             │ /api/v1/reports/template/header      │ Authenticated   │ Retrieve current HeaderConfig directly
   Template         │ PUT             │ /api/v1/reports/template/header      │ IQAC            │ Update HeaderConfig (names, subheaders, logo IDs)
   Assets           │ POST            │ /api/v1/reports/assets/upload        │ IQAC            │ Upload LEFT or RIGHT logo (multipart/form-data)
   Assets           │ GET             │ /api/v1/reports/assets               │ Authenticated   │ List all uploaded assets for the institution
   Assets           │ GET             │ /api/v1/reports/assets/{assetId}     │ Authenticated   │ Get asset metadata (file size, type, checksum)
   Assets           │ GET             │ /api/v1/reports/assets/{assetId}/raw │ Authenticated   │ Stream raw image binary for preview
   Assets           │ DELETE          │ /api/v1/reports/assets/{assetId}     │ IQAC            │ Delete asset and unlink from HeaderConfig
   History          │ GET             │ /api/v1/reports                      │ Authenticated   │ List all generated reports with artifact metadata
   History          │ GET             │ /api/v1/reports/{reportId}           │ Authenticated   │ Get report metadata and artifacts by report ID
  ──────                                                                                                                                           
  ### 4. APIs & Services Modified and Why                                                                                                          
                                                                                                                                                   
  1. ReportTemplateService.java:                                                                                                                   
      • Added getInstitutionTemplate(), saveInstitutionTemplate(), getHeaderConfig(), saveHeaderConfig(), and toAssetDto().                        
      • Updated resolveTemplate() to cascade: specific template → common institution template → system defaults. This ensures that any branding or 
      logo change by IQAC immediately takes effect across all report generators without recompilation.                                             
  2. ReportOrchestrationService.java:                                                                                                              
      • Added listGeneratedReports() and getGeneratedReport() to provide full metadata and artifact summaries for the future Generated Reports UI. 
  3. ReportTemplateRepository.java & ReportRepository.java:                                                                                        
      • Added query methods: findFirstByInstitutionIdAndIsDefaultTrue(), findAllByOrderByGeneratedAtDesc(), and                                    
      findByInstitutionIdOrderByGeneratedAtDesc().                                                                                                 
  4. ReportAssetType.java:                                                                                                                         
      • Added LEFT_LOGO, RIGHT_LOGO, and WATERMARK enums to explicitly enforce the two-logo position model.                                        
                                                                                                                                                   
  ──────                                                                                                                                           
  ### 5. Files Changed                                                                                                                             
                                                                                                                                                   
  1. src/main/java/com/dypiu/nba/reports/model/ReportAssetDto.java (Created)                                                                       
  2. src/main/java/com/dypiu/nba/reports/model/ReportAssetType.java                                                                                
  3. src/main/java/com/dypiu/nba/reports/repository/ReportTemplateRepository.java                                                                  
  4. src/main/java/com/dypiu/nba/reports/repository/ReportRepository.java                                                                          
  5. src/main/java/com/dypiu/nba/reports/template/ReportTemplateService.java                                                                       
  6. src/main/java/com/dypiu/nba/reports/service/ReportOrchestrationService.java                                                                   
  7. src/main/java/com/dypiu/nba/reports/controller/ReportsController.java                                                                         
  8. src/test/java/com/dypiu/nba/reports/Phase55ReportManagementApiIntegrationTest.java (Created)                                                  
  ──────                                                                                                                                           
  ### 6. Tests Added                                                                                                                               
                                                                                                                                                   
  • Phase55ReportManagementApiIntegrationTest.java:                                                                                                
      1. testGetInstitutionalTemplate: IQAC retrieves active institutional template.                                                               
      2. testUpdateInstitutionalTemplate: IQAC updates institution name, accreditation text, and header config.                                    
      3. testFacultyCannotUpdateTemplate: Verifies 403 Forbidden when non-IQAC roles attempt template changes.                                     
      4. testLogoUploadViewAndDeleteLifecycle: Tests complete lifecycle of upload, header linking, raw streaming, and deletion/unlinking.          
      5. testInvalidFileUploadRejected: Tests validation failure (400 Bad Request) for empty files and illegal extensions.                         
      6. testListGeneratedReportsAndDetails: Tests report history retrieval, artifact summaries, and downloading via artifact ID.                  
                                                                                                                                                   
  ──────                                                                                                                                           
  ### 7. Full Test Suite Execution Result                                                                                                          
                                                                                                                                                   
    [INFO] Results:                                                                                                                                
    [INFO] Tests run: 326, Failures: 0, Errors: 0, Skipped: 0                                                                                      
    [INFO] BUILD SUCCESS                                                                                                                           
    [INFO] Total time:  54.404 s                                                                                                                   
                                                                                                                                                   
  326 / 326 tests passing with 0 errors and 0 failures.                                                                                            
  ──────                                                                                                                                           
   Final Frontend-Ready API Contract (Phase 6 Reference)                                                                                           
                                                                                                                                                   
  ### Section A: Report Generation & Download APIs                                                                                                 
                                                                                                                                                   
  • All responses return binary streams with Content-Disposition: attachment; filename="...".                                                      
                                                                                                                                                   
  1. Programme Attainment Master PDF: GET /api/v1/reports/programme-attainment/{programmeBatchId}/master/pdf                                       
  2. Programme Attainment Master Excel: GET /api/v1/reports/programme-attainment/{programmeBatchId}/master/excel                                   
  3. Programme Attainment Section PDF: GET /api/v1/reports/programme-attainment/{programmeBatchId}/section/{section}/pdf                           
  (Sections: AVERAGE_MAPPING, AVERAGE_DIRECT, AVERAGE_INDIRECT, OVERALL)                                                                           
  4. Programme Attainment Section Excel: GET /api/v1/reports/programme-attainment/{programmeBatchId}/section/{section}/excel                       
  5. Course Attainment PDF: GET /api/v1/reports/course-attainment/{programmeBatchCourseId}/pdf                                                     
  6. Course Attainment Excel: GET /api/v1/reports/course-attainment/{programmeBatchCourseId}/excel                                                 
  7. Programme ATR PDF: GET /api/v1/reports/programme-atr/{programmeBatchId}/pdf                                                                   
  8. Programme ATR Excel: GET /api/v1/reports/programme-atr/{programmeBatchId}/excel                                                               
  9. Course ATR PDF: GET /api/v1/reports/course-atr/{programmeBatchCourseId}/pdf                                                                   
  10. Course ATR Excel: GET /api/v1/reports/course-atr/{programmeBatchCourseId}/excel                                                              
  ──────                                                                                                                                           
  ### Section B: IQAC Report Template APIs                                                                                                         
                                                                                                                                                   
  #### 1. Get Institutional Template                                                                                                               
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports/template                                                                                                    
  • Query Params: institutionId (Optional, defaults to "DYPIU")                                                                                    
  • Response (200 OK):                                                                                                                             
    {                                                                                                                                              
      "success": true,                                                                                                                             
      "data": {                                                                                                                                    
        "id": "tpl-def-programme_attainment",                                                                                                      
        "templateName": "Standard Template",                                                                                                       
        "templateVersion": 1,                                                                                                                      
        "institutionId": "DYPIU",                                                                                                                  
        "headerConfig": {                                                                                                                          
          "institutionName": "D. Y. PATIL INTERNATIONAL UNIVERSITY, PUNE",                                                                         
          "subHeader": "Sector 29, Nigdi Pradhikaran, Akurdi, Pune, Maharashtra 411044",                                                           
          "accreditationText": "Approved by AICTE | Outcome-Based Education (OBE) NBA Compliance",                                                 
          "leftLogoAssetId": "ast-leftlogo",                                                                                                       
          "rightLogoAssetId": "ast-rightlogo",                                                                                                     
          "showLogo": true                                                                                                                         
        },                                                                                                                                         
        "footerConfig": {                                                                                                                          
          "standardFooterText": "DYPIU NBA Attainment System · Authoritative Academic Record",                                                     
          "showPageNumbers": true,                                                                                                                 
          "showGeneratedTimestamp": true,                                                                                                          
          "showVerificationHash": true                                                                                                             
        }                                                                                                                                          
      }                                                                                                                                            
    }                                                                                                                                              
                                                                                                                                                   
                                                                                                                                                   
  #### 2. Update Institutional Template (IQAC Only)                                                                                                
                                                                                                                                                   
  • Method & Path: PUT /api/v1/reports/template                                                                                                    
  • Headers: Authorization: Bearer <JWT_TOKEN> (Must have IQAC role)                                                                               
  • Body: ReportTemplateDto (JSON)                                                                                                                 
  • Response (200 OK): Updated ReportTemplateDto.                                                                                                  
                                                                                                                                                   
  #### 3. Update Header Config Directly (IQAC Only)                                                                                                
                                                                                                                                                   
  • Method & Path: PUT /api/v1/reports/template/header                                                                                             
  • Body:                                                                                                                                          
    {                                                                                                                                              
      "institutionName": "D. Y. PATIL INTERNATIONAL UNIVERSITY, PUNE",                                                                             
      "subHeader": "Sector 29, Nigdi Pradhikaran, Akurdi, Pune, Maharashtra 411044",                                                               
      "accreditationText": "Approved by AICTE | NBA Compliance",                                                                                   
      "leftLogoAssetId": "ast-leftlogo",                                                                                                           
      "rightLogoAssetId": "ast-rightlogo",                                                                                                         
      "showLogo": true                                                                                                                             
    }                                                                                                                                              
                                                                                                                                                   
  • Response (200 OK): Updated HeaderConfig.                                                                                                       
  ──────                                                                                                                                           
  ### Section C: Report Asset & Logo Management APIs                                                                                               
                                                                                                                                                   
  #### 1. Upload Logo (IQAC Only)                                                                                                                  
                                                                                                                                                   
  • Method & Path: POST /api/v1/reports/assets/upload                                                                                              
  • Content-Type: multipart/form-data                                                                                                              
  • Form Data:                                                                                                                                     
      • file: <Binary Image File> (PNG, JPG, JPEG, SVG, WEBP; max 5MB)                                                                             
      • assetType: "LEFT_LOGO" or "RIGHT_LOGO"                                                                                                     
      • institutionId: "DYPIU" (Optional)                                                                                                          
  • Behavior: Automatically saves the image and updates the active HeaderConfig with the new asset ID.                                             
  • Response (200 OK):                                                                                                                             
    {                                                                                                                                              
      "success": true,                                                                                                                             
      "message": "Report asset uploaded successfully and linked to header template",                                                               
      "data": {                                                                                                                                    
        "assetId": "ast-4f2a1b9c",                                                                                                                 
        "institutionId": "DYPIU",                                                                                                                  
        "assetType": "LEFT_LOGO",                                                                                                                  
        "originalFilename": "dypiu_main_logo.png",                                                                                                 
        "storagePath": "assets/DYPIU/9a8b7c_dypiu_main_logo.png",                                                                                  
        "mimeType": "image/png",                                                                                                                   
        "fileSize": 45210,                                                                                                                         
        "createdBy": "iqac@dypiu.ac.in",                                                                                                           
        "createdAt": "2026-09-04T13:28:00+05:30"                                                                                                   
      }                                                                                                                                            
    }                                                                                                                                              
                                                                                                                                                   
                                                                                                                                                   
  #### 2. Stream Raw Logo for Frontend Preview                                                                                                     
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports/assets/{assetId}/raw (or /view)                                                                             
  • Response (200 OK): Binary image stream with appropriate Content-Type: image/png (use directly in <img src="/api/v1/reports/assets/ast-xxx/raw" 
  />).                                                                                                                                             
                                                                                                                                                   
  #### 3. List Assets                                                                                                                              
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports/assets?institutionId=DYPIU                                                                                  
  • Response (200 OK): Array of ReportAssetDto.                                                                                                    
                                                                                                                                                   
  #### 4. Delete Asset (IQAC Only)                                                                                                                 
                                                                                                                                                   
  • Method & Path: DELETE /api/v1/reports/assets/{assetId}                                                                                         
  • Behavior: Deletes file from storage, removes database record, and unlinks from HeaderConfig.                                                   
  • Response (200 OK): {"success": true, "message": "Report asset deleted successfully"}.                                                          
  ──────                                                                                                                                           
  ### Section D: Generated Reports History APIs                                                                                                    
                                                                                                                                                   
  #### 1. List Generated Reports                                                                                                                   
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports                                                                                                             
  • Query Parameters (All Optional):                                                                                                               
      • reportType: COURSE_ATTAINMENT, PROGRAMME_ATTAINMENT, COURSE_ATR, PROGRAMME_ATR                                                             
      • masterProgrammeId: Programme ID                                                                                                            
      • programmeBatchId: Batch ID                                                                                                                 
      • programmeBatchCourseId: Course Offering ID                                                                                                 
      • masterCourseId: Master Course ID                                                                                                           
      • institutionId: Defaults to "DYPIU"                                                                                                         
  • Response (200 OK):                                                                                                                             
    {                                                                                                                                              
      "success": true,                                                                                                                             
      "data": [                                                                                                                                    
        {                                                                                                                                          
          "reportId": "rep-7d41f391",                                                                                                              
          "reportType": "COURSE_ATTAINMENT",                                                                                                       
          "institutionId": "DYPIU",                                                                                                                
          "programmeBatchCourseId": "off-cs401",                                                                                                   
          "masterCourseId": "mc-cs401",                                                                                                            
          "templateId": "tpl-def-course_attainment",                                                                                               
          "templateVersion": 1,                                                                                                                    
          "generatedBy": "Dr. Alice Sharma",                                                                                                       
          "generatedAt": "2026-09-04T13:25:00+05:30",                                                                                              
          "status": "GENERATED",                                                                                                                   
          "artifacts": [                                                                                                                           
            {                                                                                                                                      
              "artifactId": "art-pdf-1a2b3c4d",                                                                                                    
              "artifactType": "PDF",                                                                                                               
              "originalFilename": "COURSE_ATTAINMENT_CS401_SEM7.pdf",                                                                              
              "mimeType": "application/pdf",                                                                                                       
              "fileSize": 184520,                                                                                                                  
              "sha256Checksum": "9e107d9d372bb6826bd81d3542a419d6dae1b219e18b82432d667c13203fe364",                                                
              "hmacSignature": "a3b2c1...",                                                                                                        
              "generatedAt": "2026-09-04T13:25:01+05:30"                                                                                           
            },                                                                                                                                     
            {                                                                                                                                      
              "artifactId": "art-xls-5e6f7a8b",                                                                                                    
              "artifactType": "EXCEL",                                                                                                             
              "originalFilename": "COURSE_ATTAINMENT_CS401_SEM7.xlsx",                                                                             
              "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",                                                     
              "fileSize": 54200,                                                                                                                   
              "sha256Checksum": "7a8b9c...",                                                                                                       
              "hmacSignature": "d4e5f6...",                                                                                                        
              "generatedAt": "2026-09-04T13:25:01+05:30"                                                                                           
            }                                                                                                                                      
          ]                                                                                                                                        
        }                                                                                                                                          
      ]                                                                                                                                            
    }                                                                                                                                              
                                                                                                                                                   
                                                                                                                                                   
  #### 2. Get Single Report Details                                                                                                                
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports/{reportId}                                                                                                  
  • Response (200 OK): Single GeneratedReportDto containing snapshot and artifact list.                                                            
  ──────                                                                                                                                           
  ### Section E: Artifact Download API                                                                                                             
                                                                                                                                                   
  • Method & Path: GET /api/v1/reports/artifacts/{artifactId}/download                                                                             
  • Response (200 OK): Binary stream of the exact persisted PDF or Excel artifact.                                                                 
  ──────                                                                                                                                           
  ### Section F: Integrity Verification API                                                                                                        
                                                                                                                                                   
  • Method & Path: POST /api/v1/reports/verify                                                                                                     
  • Content-Type: multipart/form-data                                                                                                              
  • Form Data:                                                                                                                                     
      • reportId: Report ID string                                                                                                                 
      • artifactType: "PDF" or "EXCEL"                                                                                                             
      • file: <Uploaded Binary File>                                                                                                               
  • Response (200 OK): Cryptographic verification status (validates both SHA-256 and HMAC-SHA256). 