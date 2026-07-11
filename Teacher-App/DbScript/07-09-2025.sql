GO

ALTER TABLE [dbo].[CurriculumEmbeddings] DROP CONSTRAINT [DF__Curriculu__Creat__4B422AD5]
GO

/****** Object:  Table [dbo].[CurriculumEmbeddings]    Script Date: 7/9/2025 5:49:59 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CurriculumEmbeddings]') AND type in (N'U'))
DROP TABLE [dbo].[CurriculumEmbeddings]
GO

/****** Object:  Table [dbo].[CurriculumEmbeddings]    Script Date: 7/9/2025 5:49:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CurriculumEmbeddings](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[Grade] [nvarchar](50) NOT NULL,
	[SubjectName] [nvarchar](100) NULL,
	[ChapterNo] [nvarchar](100) NULL,
	[FileName] [nvarchar](400) NULL,
	[Title] [nvarchar](max) NULL,
	[OriginalText] [nvarchar](max) NULL,
	[Embedding] [nvarchar](max) NULL,
	[Metadata] [nvarchar](max) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedDate] [datetime] NULL,
 CONSTRAINT [PK__Curricul__3214EC0732DDAC81] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[CurriculumEmbeddings] ADD  CONSTRAINT [DF__Curriculu__Creat__4B422AD5]  DEFAULT (getdate()) FOR [CreatedDate]
GO


GO

/****** Object:  StoredProcedure [dbo].[AddCurriculumPdfEmbedding]    Script Date: 7/9/2025 5:49:40 PM ******/
DROP PROCEDURE [dbo].[AddCurriculumPdfEmbedding]
GO

/****** Object:  StoredProcedure [dbo].[getCurriculumBySchoolGradeSubject]    Script Date: 7/9/2025 5:49:40 PM ******/
DROP PROCEDURE [dbo].[getCurriculumBySchoolGradeSubject]
GO

/****** Object:  StoredProcedure [dbo].[getCurriculumBySchoolGradeSubject]    Script Date: 7/9/2025 5:49:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
--EXEC getCurriculumBySchoolGradeSubject 1,3,'Math'
-- =============================================
CREATE PROCEDURE [dbo].[getCurriculumBySchoolGradeSubject]
	@SchoolId int,
	@Grade Varchar(100),
	@Subject VARCHAR(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

Select SchoolId,Grade,SubjectName As Subject, ChapterNo, OriginalText As Standards ,CreatedDate as LessonDate  from CurriculumEmbeddings Where SchoolId=@SchoolId and Grade=@Grade AND SubjectName=@Subject
END
GO

/****** Object:  StoredProcedure [dbo].[AddCurriculumPdfEmbedding]    Script Date: 7/9/2025 5:49:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[AddCurriculumPdfEmbedding]    
	@SchoolId  int,
	@Grade NVARCHAR(50),
	@Subject NVARCHAR(100),
	@ChapterNo NVARCHAR(200),
    @Title NVARCHAR(400),
	@FileName  NVARCHAR(400),
    @OriginalText NVARCHAR(MAX),
    --@Embedding VARBINARY(MAX),
    @Metadata NVARCHAR(MAX),  
    @CreatedBy [nvarchar](200),
	@IsSuccess [bit] = 0 OUTPUT,
	@Message [nvarchar](400) = '' OUTPUT

WITH EXECUTE AS CALLER
AS
BEGIN
BEGIN TRY
	SET NOCOUNT ON;
	   BEGIN TRANSACTION;


	DECLARE @UserId INT,@Id Int;
	SELECT @UserId = UserId FROM Users WHERE UserIdentityId= @CreatedBy;

	-- DECLARE @ScopeLevel NVARCHAR(400)=(Select  CONCAT(S.StateName,' / ',D.DistrictName,' / ',SM.Name,' / ',@Grade,' / ',@Subject)  From SchoolManagement SM INNER JOIN [State] S ON SM.StateId=S.StateId INNER JOIN District D ON SM.DistrictId=D.DistrictId Where SchoolId=@SchoolId)

    INSERT INTO CurriculumEmbeddings        
           (
		    [SchoolId]	
           ,[Grade]
           ,[SubjectName]
		   ,[ChapterNo]
           ,[Title]
		   ,[FileName]
           ,[OriginalText]
           --,[Embedding]
           ,[Metadata]           
           ,[CreatedDate]
		   ,[CreatedBy]
    )
    VALUES (  
	    @SchoolId,        
        @Grade,
        @Subject,
		@ChapterNo,
		@Title,
		@FileName,
        @OriginalText,
     --   @Embedding,
        @Metadata,
        GETDATE(),
        @UserId
    )


		SET @IsSuccess=1;
		SET @Message = 'Successfully added.';
 COMMIT;
    END TRY
    BEGIN CATCH
			ROLLBACK TRANSACTION;
			   SELECT @IsSuccess AS IsSuccess,ERROR_MESSAGE() AS Message;
    END CATCH;
END



GO


