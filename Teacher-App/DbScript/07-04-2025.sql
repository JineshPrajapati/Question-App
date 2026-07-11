
/****** Object:  Table [dbo].[CurriculumEmbeddings]    Script Date: 7/4/2025 4:02:34 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CurriculumEmbeddings](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[TeacherId] [int] NOT NULL,
	[Grade] [nvarchar](50) NOT NULL,
	[SubjectName] [nvarchar](100) NULL,
	[Title] [nvarchar](255) NULL,
	[OriginalText] [nvarchar](max) NULL,
	[Embedding] [varbinary](max) NULL,
	[Metadata] [nvarchar](max) NULL,
	[ScopeLevel] [nvarchar](400) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

GO
/****** Object:  StoredProcedure [dbo].[AddLessonPlanEmbeddings]    Script Date: 7/4/2025 10:43:44 AM ******/
SET ANSI_NULLS ON
GO

GO
ALTER PROCEDURE [dbo].[AddCurriculumPdfEmbedding]
    @SchoolId int=1,
	@TeacherId  int=1,
	@Grade NVARCHAR(50)='',
	@Subject NVARCHAR(100)='',
    @Title NVARCHAR(250)='',
    @OriginalText NVARCHAR(MAX)='',
    @Embedding NVARCHAR(MAX)='',
    @Metadata NVARCHAR(MAX)=',',  
    @CreatedBy [nvarchar](200)=',',
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

	DECLARE @ScopeLevel NVARCHAR(400)=(Select  CONCAT(S.StateName,' / ',D.DistrictName,' / ',SM.Name,' / ',@Grade,' / ',@Subject)  From SchoolManagement SM INNER JOIN [State] S ON SM.StateId=S.StateId INNER JOIN District D ON SM.DistrictId=D.DistrictId Where SchoolId=@SchoolId)

    INSERT INTO CurriculumEmbeddings        
           (
		    [SchoolId]
		   ,[TeacherId]
           ,[Grade]
           ,[SubjectName]
           ,[Title]
           ,[OriginalText]
           ,[Embedding]
           ,[Metadata]
           ,[ScopeLevel]       
           ,[CreatedDate]
		   ,[CreatedBy]
    )
    VALUES (  
	    @SchoolId,
        @TeacherId,
        @Grade,
        @Subject,
		@Title,
        @OriginalText,
        Cast(@Embedding as varbinary(MAX)), 
        @Metadata,
		@ScopeLevel,
        GETDATE(),
        @UserId
    )


		SET @IsSuccess=1;
		SET @Message = 'Successfully added.';
 COMMIT;
    END TRY
    BEGIN CATCH
			ROLLBACK TRANSACTION;
			   SET @IsSuccess=0
			   SET @Message=ERROR_MESSAGE() ;
    END CATCH;
END



GO


GO


GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchoolSubjects]') AND type in (N'U'))
ALTER TABLE [dbo].[SchoolSubjects] DROP CONSTRAINT IF EXISTS [DF__SchoolSub__Creat__4589517F]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchoolSubjects]') AND type in (N'U'))
ALTER TABLE [dbo].[SchoolSubjects] DROP CONSTRAINT IF EXISTS [DF__SchoolSub__Creat__44952D46]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchoolManagement]') AND type in (N'U'))
ALTER TABLE [dbo].[SchoolManagement] DROP CONSTRAINT IF EXISTS [DF__SchoolMan__IsDel__0A9D95DB]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchoolManagement]') AND type in (N'U'))
ALTER TABLE [dbo].[SchoolManagement] DROP CONSTRAINT IF EXISTS [DF__SchoolMan__IsAct__09A971A2]
GO
/****** Object:  Table [dbo].[TeacherLeaves]    Script Date: 7/4/2025 4:05:35 PM ******/
DROP TABLE IF EXISTS [dbo].[TeacherLeaves]
GO
/****** Object:  Table [dbo].[SchoolSubjects]    Script Date: 7/4/2025 4:05:35 PM ******/
DROP TABLE IF EXISTS [dbo].[SchoolSubjects]
GO
/****** Object:  Table [dbo].[SchoolManagement]    Script Date: 7/4/2025 4:05:35 PM ******/
DROP TABLE IF EXISTS [dbo].[SchoolManagement]
GO
/****** Object:  Table [dbo].[SchoolHolidays]    Script Date: 7/4/2025 4:05:35 PM ******/
DROP TABLE IF EXISTS [dbo].[SchoolHolidays]
GO
/****** Object:  Table [dbo].[SchoolHolidays]    Script Date: 7/4/2025 4:05:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SchoolHolidays](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[HolidayDate] [date] NOT NULL,
	[Reason] [nvarchar](200) NULL,
	[CreatedDate] [date] NOT NULL,
	[Createdby] [int] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedDate] [date] NULL,
 CONSTRAINT [PK_SchoolHolidays] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SchoolManagement]    Script Date: 7/4/2025 4:05:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SchoolManagement](
	[SchoolId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolCode] [varchar](200) NOT NULL,
	[Name] [varchar](200) NOT NULL,
	[Address] [varchar](200) NULL,
	[StateId] [int] NULL,
	[DistrictId] [int] NULL,
	[CityId] [int] NULL,
	[ZipCode] [int] NULL,
	[Status] [int] NULL,
	[Email] [varchar](200) NOT NULL,
	[ContactNumber] [varchar](20) NULL,
	[CreatedBy] [int] NULL,
	[CreatedDate] [datetime] NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedDate] [datetime] NULL,
	[IsActive] [bit] NULL,
	[IsDelete] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SchoolSubjects]    Script Date: 7/4/2025 4:05:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SchoolSubjects](
	[SchoolId] [int] NULL,
	[SchoolName] [varchar](100) NULL,
	[State] [varchar](50) NULL,
	[District] [varchar](100) NULL,
	[Grade] [varchar](5) NULL,
	[Subject] [varchar](50) NULL,
	[CreatedDate] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[ModifiedDate] [datetime] NULL,
	[ModifiedBy] [int] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TeacherLeaves]    Script Date: 7/4/2025 4:05:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TeacherLeaves](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TeacherId] [int] NOT NULL,
	[LeaveDate] [date] NOT NULL,
	[Reason] [nvarchar](200) NULL,
	[CreatedDate] [date] NOT NULL,
	[Createdby] [int] NOT NULL,
	[ModifiedBy] [int] NULL,
	[ModifiedDate] [date] NULL,
 CONSTRAINT [PK_TeacherLeaves] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[SchoolManagement] ON 
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (1, N'S-001', N'Brooklyn Academy', N'456 Flatbush Ave', 1, 2, 2, 11201, 1, N'brooklyn@academy.org', N'+1-212-000-2222', 1, CAST(N'2025-05-22T05:33:49.220' AS DateTime), NULL, CAST(N'2025-05-23T06:29:04.853' AS DateTime), 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (2, N'S-002', N'Austin Innovation School', N'159 Congress Ave', 3, 7, 7, 73301, 1, N'austin@innovschool.org', N'+1-512-000-2222', 1, CAST(N'2025-05-22T05:33:49.220' AS DateTime), 3, CAST(N'2025-05-23T01:03:09.183' AS DateTime), 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (5, N'S-003', N'Bhoomi Patel', N'Ahm', 1, 2, 3, 35555, NULL, N'bhoomi.s@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T02:05:38.687' AS DateTime), 7, CAST(N'2025-05-23T02:23:57.817' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (6, N'S-004', N'Juniper Ridge School', N'Ahm', 1, 2, 3, 35555, NULL, N'juniper@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T02:20:45.927' AS DateTime), 7, CAST(N'2025-05-23T02:22:22.040' AS DateTime), 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (7, N'S-005', N'San Diego Science Academy', N'Ahm', 3, 6, 6, 35555, NULL, N'sanDiego@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T04:43:49.080' AS DateTime), NULL, NULL, 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (8, N'S-006', N'Pineview Elementary', N'Ahm', 2, 4, 4, 35555, NULL, N'pineview@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T04:56:19.810' AS DateTime), NULL, NULL, 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (9, N'S-007', N'Hawthorn High', N'Ahm', 1, 2, 2, 35555, NULL, N'hawthorn@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T05:17:16.353' AS DateTime), 7, CAST(N'2025-05-23T05:57:13.260' AS DateTime), 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (10, N'S-008', N'Mossy Oak Middle School', N'Ahm', 3, 6, 6, 35555, NULL, N'mossy@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T06:00:44.117' AS DateTime), 7, CAST(N'2025-05-23T06:29:26.710' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (11, N'S-009', N'Pinebrook Middle School', N'Ahm', 1, 2, 2, 35550, NULL, N'pinebrook@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T06:19:55.867' AS DateTime), 7, CAST(N'2025-05-23T06:21:06.470' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (12, N'S-010', N' Valleyview Elementary', N'Ahm', 1, 2, 2, 35555, NULL, N'valleyview@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-23T06:31:35.120' AS DateTime), 7, CAST(N'2025-05-23T06:31:59.490' AS DateTime), 1, 0)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (13, N'S-011', N'new ', N'Ahm', 2, 4, 4, 35555, NULL, N'new@cementdigital.com', N'78876777876', 7, CAST(N'2025-05-30T04:49:08.060' AS DateTime), 7, CAST(N'2025-06-04T07:47:17.650' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (14, N'S-012', N't', N'Ahm', 2, 4, 4, 35555, NULL, N'tttt@cementdigital.com', N'78876777876', 7, CAST(N'2025-06-04T07:42:14.880' AS DateTime), 7, CAST(N'2025-06-04T07:47:14.623' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (15, N'S-013', N'abcd', N'Ahm', 2, 4, 4, 35555, NULL, N'abcd@cementdigital.com', N'78876777876', 7, CAST(N'2025-06-04T07:43:28.430' AS DateTime), 7, CAST(N'2025-06-04T07:47:11.567' AS DateTime), 0, 1)
GO
INSERT [dbo].[SchoolManagement] ([SchoolId], [SchoolCode], [Name], [Address], [StateId], [DistrictId], [CityId], [ZipCode], [Status], [Email], [ContactNumber], [CreatedBy], [CreatedDate], [ModifiedBy], [ModifiedDate], [IsActive], [IsDelete]) VALUES (16, N'S-014', N'vivek dobariya', N'Tankara', 1, 2, 2, 35555, NULL, N'vvv@cementdigital.com', N'78876777876', 7, CAST(N'2025-06-04T07:48:03.457' AS DateTime), 7, CAST(N'2025-06-04T07:48:14.917' AS DateTime), 0, 1)
GO
SET IDENTITY_INSERT [dbo].[SchoolManagement] OFF
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'K', N'English Language Arts', CAST(N'2025-07-04T11:38:44.717' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'K', N'Mathematics', CAST(N'2025-07-04T11:38:44.717' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'K', N'Art', CAST(N'2025-07-04T11:38:44.717' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'1', N'English Language Arts', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'1', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'1', N'Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'1', N'Social Studies', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'2', N'English Language Arts', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'2', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'2', N'Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'2', N'Social Studies', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'3', N'English Language Arts', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'3', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'3', N'Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'3', N'Social Studies', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'4', N'English Language Arts', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'4', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'4', N'Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'4', N'Social Studies', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'5', N'English Language Arts', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'5', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'5', N'Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'5', N'Social Studies', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'6', N'English', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'6', N'Mathematics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'6', N'Earth Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'6', N'Geography', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'7', N'English', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'7', N'Pre-Algebra', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'7', N'Life Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'7', N'Civics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'8', N'English', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'8', N'Algebra I', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'8', N'Physical Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'8', N'US History', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'9', N'English I', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'9', N'Algebra I', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'9', N'Biology', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'9', N'World History', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'10', N'English II', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'10', N'Geometry', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'10', N'Chemistry', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'10', N'Civics & Economics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'11', N'English III', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'11', N'Algebra II', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'11', N'Physics', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'11', N'US History', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'12', N'English IV', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'12', N'Pre-Calculus', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'12', N'Environmental Science', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
INSERT [dbo].[SchoolSubjects] ([SchoolId], [SchoolName], [State], [District], [Grade], [Subject], [CreatedDate], [CreatedBy], [ModifiedDate], [ModifiedBy]) VALUES (1001, N'Greenwood Public School', N'California', N'Los Angeles Unified', N'12', N'Government', CAST(N'2025-07-04T11:40:37.570' AS DateTime), 1, NULL, NULL)
GO
ALTER TABLE [dbo].[SchoolManagement] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[SchoolManagement] ADD  DEFAULT ((0)) FOR [IsDelete]
GO
ALTER TABLE [dbo].[SchoolSubjects] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO
ALTER TABLE [dbo].[SchoolSubjects] ADD  DEFAULT ((1)) FOR [CreatedBy]
GO
