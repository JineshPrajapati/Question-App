
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__Creat__15DA3E5D]
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__Holid__14E61A24]
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__IsReu__13F1F5EB]
GO

/****** Object:  Table [dbo].[LessonFiles]    Script Date: 7/11/2025 4:56:56 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonFiles]') AND type in (N'U'))
DROP TABLE [dbo].[LessonFiles]
GO

/****** Object:  Table [dbo].[LessonPlans]    Script Date: 7/11/2025 4:56:56 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonPlans]') AND type in (N'U'))
DROP TABLE [dbo].[LessonPlans]
GO

/****** Object:  Table [dbo].[SchoolGrades]    Script Date: 7/11/2025 4:56:56 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchoolGrades]') AND type in (N'U'))
DROP TABLE [dbo].[SchoolGrades]
GO

/****** Object:  Table [dbo].[SchoolGrades]    Script Date: 7/11/2025 4:56:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SchoolGrades](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[GradeName] [nvarchar](50) NOT NULL,
	[AcademicStartDate] [datetime] NULL,
	[AcademicEndDate] [datetime] NULL,
 CONSTRAINT [PK_SchoolGradeSubject] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[LessonPlans]    Script Date: 7/11/2025 4:56:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[LessonPlans](
	[LessonPlanId] [int] IDENTITY(1,1) NOT NULL,
	[LessonTitle] [nvarchar](200) NULL,
	[LessonDescription] [nvarchar](400) NULL,
	[SchoolId] [int] NULL,
	[TeacherId] [int] NULL,
	[Subject] [nvarchar](100) NULL,
	[Grade] [nvarchar](50) NULL,
	[LessonType] [nvarchar](100) NULL,
	[StartDate] [date] NULL,
	[EndDate] [date] NULL,
	[LessonContent] [nvarchar](max) NULL,
	[IsReusable] [bit] NULL,
	[HolidayAdjusted] [bit] NULL,
	[IsActive] [bit] NULL,
	[CreatedDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[ModifiedDate] [datetime] NULL,
 CONSTRAINT [PK__LessonPl__0229AF5D17AFBF74] PRIMARY KEY CLUSTERED 
(
	[LessonPlanId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[LessonFiles]    Script Date: 7/11/2025 4:56:56 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[LessonFiles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[Grade] [nvarchar](50) NOT NULL,
	[Subject] [nvarchar](100) NOT NULL,
	[FileContentType] [nvarchar](50) NOT NULL,
	[FileName] [nvarchar](200) NOT NULL,
	[FileContent] [varbinary](max) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_LessonFiles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__IsReu__13F1F5EB]  DEFAULT ((1)) FOR [IsReusable]
GO

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__Holid__14E61A24]  DEFAULT ((0)) FOR [HolidayAdjusted]
GO

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__Creat__15DA3E5D]  DEFAULT (getdate()) FOR [CreatedDate]
GO



GO

/****** Object:  StoredProcedure [dbo].[AddLessonFiles]    Script Date: 7/11/2025 4:55:08 PM ******/
DROP PROCEDURE [dbo].[AddLessonFiles]
GO

/****** Object:  StoredProcedure [dbo].[AddLessonPlan]    Script Date: 7/11/2025 4:55:08 PM ******/
DROP PROCEDURE [dbo].[AddLessonPlan]
GO

/****** Object:  StoredProcedure [dbo].[AddLessonPlan]    Script Date: 7/11/2025 4:55:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[AddLessonPlan]
    @TeacherId int,
    @Grade nvarchar(100),
    @Subject nvarchar(100),
    @LessonTitle NVARCHAR(200),
    @StartDate DATE,
    @EndDate DATE,
	@LessonContent nvarchar(max),
    @LessonDescription NVARCHAR(MAX),
	@LessonType NVARCHAR(200)='Daily', 
    @IsReusable BIT,
    @HolidayAdjusted BIT,
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

    INSERT INTO LessonPlans (       
        TeacherId,
        Grade,
        Subject,
        LessonTitle,
        StartDate,
        EndDate,
		LessonContent,
        LessonDescription,    
        IsReusable,
        HolidayAdjusted,
        LessonType,
        CreatedDate,
        CreatedBy
    )
    VALUES (        
        @TeacherId,
        @Grade,
        @Subject,
        @LessonTitle,
        @StartDate,
        @EndDate,
		@LessonContent,
        @LessonDescription, 
        @IsReusable,
        @HolidayAdjusted,
        @LessonType,
        GETDATE(),
        @UserId
    );


		SET @IsSuccess=1;
			SET @Message = 'Lesson Plan has been successfully added.';
 COMMIT;
    END TRY
    BEGIN CATCH
			ROLLBACK TRANSACTION;
			   SELECT @IsSuccess AS IsSuccess,ERROR_MESSAGE() AS Message;
    END CATCH;
END



GO

/****** Object:  StoredProcedure [dbo].[AddLessonFiles]    Script Date: 7/11/2025 4:55:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[AddLessonFiles]
	@SchoolId int,
	@Grade nvarchar(50),
	@Subject nvarchar(100),
	@FileContentType nvarchar(50),
	@FileName Nvarchar(400),
	@FileContent VARBINARY(MAX),
	@CreatedBy	NVARCHAR(200),
	@IsSuccess BIT OUTPUT,
	@Message NVARCHAR(MAX) OUTPUT
AS
BEGIN

	SET NOCOUNT ON;

	DECLARE @UserId INT;
	SELECT @UserId = UserId FROM Users WHERE UserIdentityId= @CreatedBy;

    
	INSERT INTO LessonFiles(SchoolId,Grade,Subject,FileContentType,FileName,FileContent,CreatedBy,CreatedDate)
	SELECT @SchoolId,@Grade,@Subject,@FileContentType,@FileName,@FileContent,@UserId,GETDATE()

	SET @IsSuccess=1
	SET @Message='File added successfully.'

END
GO


