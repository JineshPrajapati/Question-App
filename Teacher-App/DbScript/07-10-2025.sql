
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__Creat__15DA3E5D]
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__Holid__14E61A24]
GO

ALTER TABLE [dbo].[LessonPlans] DROP CONSTRAINT [DF__LessonPla__IsReu__13F1F5EB]
GO

/****** Object:  Table [dbo].[LessonPlans]    Script Date: 7/10/2025 5:24:37 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonPlans]') AND type in (N'U'))
DROP TABLE [dbo].[LessonPlans]
GO

/****** Object:  Table [dbo].[LessonPlans]    Script Date: 7/10/2025 5:24:37 PM ******/
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
	[Description] [nvarchar](max) NULL,
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

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__IsReu__13F1F5EB]  DEFAULT ((1)) FOR [IsReusable]
GO

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__Holid__14E61A24]  DEFAULT ((0)) FOR [HolidayAdjusted]
GO

ALTER TABLE [dbo].[LessonPlans] ADD  CONSTRAINT [DF__LessonPla__Creat__15DA3E5D]  DEFAULT (getdate()) FOR [CreatedDate]
GO

/****** Object:  Table [dbo].[LessonFiles]    Script Date: 7/10/2025 5:25:24 PM ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonFiles]') AND type in (N'U'))
DROP TABLE [dbo].[LessonFiles]
GO

/****** Object:  Table [dbo].[LessonFiles]    Script Date: 7/10/2025 5:25:24 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[LessonFiles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[Grade] [nvarchar](50) NOT NULL,
	[Subject] [nvarchar](100) NOT NULL,
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

GO

/****** Object:  StoredProcedure [dbo].[AddLessonFiles]    Script Date: 7/10/2025 5:23:25 PM ******/
DROP PROCEDURE [dbo].[AddLessonFiles]
GO

/****** Object:  StoredProcedure [dbo].[GetLessonFile]    Script Date: 7/10/2025 5:23:25 PM ******/
DROP PROCEDURE [dbo].[GetLessonFile]
GO

/****** Object:  StoredProcedure [dbo].[GetLessonPlanList]    Script Date: 7/10/2025 5:23:25 PM ******/
DROP PROCEDURE [dbo].[GetLessonPlanList]
GO

/****** Object:  StoredProcedure [dbo].[GetLessonPlanList]    Script Date: 7/10/2025 5:23:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--EXEC [dbo].[GetLessonPlanList] 1,'',1,5,'LessonPlanId','ASC'
CREATE   PROCEDURE [dbo].[GetLessonPlanList]
@ActiveOnly INT= -1, -- -1-Active , 0=All
@SearchTerm VARCHAR(MAX) = '',
@PageNumber INT = 1,                 
@PageSize INT = 5,
@SortBy NVARCHAR(50) = 'LessonPlanId',
@SortDirection NVARCHAR(4) = 'ASC',
@SchoolId INT = null
AS
BEGIN
	SET NOCOUNT ON;
	
	 IF @SortDirection NOT IN ('ASC', 'DESC')
        SET @SortDirection = 'ASC';

    DECLARE @OrderBy NVARCHAR(100);

	SET @OrderBy = 
        CASE 
		    WHEN @SortBy = 'LessonPlanId' THEN 'LP.LessonPlanId'
			WHEN @SortBy = 'LessonTitle' THEN 'LP.LessonTitle'
            WHEN @SortBy = 'LessonDescription' THEN 'LP.LessonDescription'      
            WHEN @SortBy = 'Grade' THEN 'LP.Grade'
            WHEN @SortBy = 'Subject' THEN 'LP.Subject'
			WHEN @SortBy = 'LessonType' THEN 'LP.LessonType'
			WHEN @SortBy = 'StartDate' THEN 'LP.StartDate'
            WHEN @SortBy = 'EndDate' THEN 'LP.EndDate'
			WHEN @SortBy = 'IsReusable' THEN 'LP.IsReusable'
			WHEN @SortBy = 'SchoolName' THEN 'S.Name'
            WHEN @SortBy = 'IsActive' THEN 'LP.IsActive'
            ELSE 'LP.LessonPlanId'
        END;

	
	 DECLARE @PageStart INT = (@PageNumber - 1) * @PageSize + 1;
    DECLARE @PageEnd INT = @PageNumber * @PageSize;

    DECLARE @SearchPattern NVARCHAR(MAX) = '%' + @SearchTerm + '%';

    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @Params NVARCHAR(MAX)

	SET @SQL = '
    WITH CTE AS (
	SELECT 
		LP.LessonPlanId,
		LP.LessonTitle,
		LP.LessonDescription,
		LP.Grade,
		LP.Subject,
		LP.LessonType,
		LP.StartDate,
		LP.EndDate,
		LP.IsReusable,
		LP.HolidayAdjusted,
	    concat(S.Name,'' ('',D.DistrictName,'')'') as SchoolName, 		
		ISNULL(S.IsActive,0) AS IsActive,
		COUNT(*) OVER () AS TotalRecords,
		ROW_NUMBER() OVER (ORDER BY ' + @OrderBy + ' ' + @SortDirection + N') AS RowNum
	FROM [LessonPlans]  LP INNER JOIN  SchoolManagement S ON LP.SchoolId=S.SchoolId
	LEFT JOIN State ST ON S.StateId = ST.StateId
	LEFT JOIN District D ON S.DistrictId = D.DistrictId
	LEFT JOIN City C ON S.CityId = C.CityId
	WHERE ISNULL(S.IsDelete,0) = 0
	AND (@ActiveOnly = -1 OR S.IsActive = @ActiveOnly) 
            AND (
                ISNULL(@SearchTerm, '''') = '''' 
                OR LP.LessonTitle LIKE @SearchPattern
                OR LP.LessonDescription LIKE @SearchPattern
                OR LP.Grade LIKE @SearchPattern
                OR LP.Subject LIKE @SearchPattern
                OR LP.LessonType LIKE @SearchPattern
                OR S.Name LIKE @SearchPattern              
            ) 
	)
			SELECT * FROM CTE WHERE RowNum BETWEEN @PageStart AND @PageEnd;
	';

	SET @Params =  N'@ActiveOnly INT, @SearchTerm NVARCHAR(MAX), @SearchPattern NVARCHAR(50), @PageStart INT, @PageEnd INT';
    EXEC sp_executesql @SQL, @Params, @ActiveOnly,@SearchTerm, @SearchPattern, @PageStart, @PageEnd;

END
GO

/****** Object:  StoredProcedure [dbo].[GetLessonFile]    Script Date: 7/10/2025 5:23:25 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
--EXEC GetLessonFile 1,'3','Math','Grade-3_Math_Model-Curriculum.pdf'
-- =============================================
CREATE PROCEDURE [dbo].[GetLessonFile]
	@SchoolId int,
	@Grade nvarchar(50),
	@Subject nvarchar(100),
	@FileName Nvarchar(400)
AS
BEGIN
	SELECT * FROM LessonFiles Where SchoolId=@SchoolId and Grade=@Grade and Subject=@Subject and FileName=@FileName
END
GO

/****** Object:  StoredProcedure [dbo].[AddLessonFiles]    Script Date: 7/10/2025 5:23:25 PM ******/
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

    
	INSERT INTO LessonFiles(SchoolId,Grade,Subject,FileName,FileContent,CreatedBy,CreatedDate)
	SELECT @SchoolId,@Grade,@Subject,@FileName,@FileContent,@UserId,GETDATE()

	SET @IsSuccess=1
	SET @Message='File added successfully.'

END
GO


