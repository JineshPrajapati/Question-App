USE [DevTeacherDbLocal]

-- [dbo].[AccessRights]
GO

INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])
     VALUES
           ('LessonPlan'
           ,'lessonplan'
           ,'index'
           ,1
           ,'/lessonplan'
           ,1
           ,1
           ,1
           ,'List all previous generated lesson plans.')


INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])

		  VALUES  ( 'LessonPlan'
           ,'lessonplan'
           ,'create'
           ,2
           ,'/lessonplan'
           ,1
           ,1
           ,1
           ,'Generated new lesson plan.')

INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])

		  VALUES  (  'LessonPlan'
           ,'lessonplan'
           ,'update'
           ,3
           ,'/lessonplan'
           ,1
           ,1
           ,1
           ,'Edit Generated  lesson plan.')


INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])

		  VALUES  ( 'LessonPlan'
           ,'lessonplan'
           ,'delete'
           ,4
           ,'/lessonplan'
           ,1
           ,1
           ,1
           ,'Remove Generated  lesson plan.')
GO




INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])

		  VALUES  ( 'Chat'
           ,'chatmessage'
           ,'get'
           ,1
           ,'/chatMessage'
           ,5
           ,1
           ,18
           ,'Teacher and student can chat with each other.')
		   
		   
GO

INSERT INTO [dbo].[AccessRights]
           ([ModuleName]
           ,[ControllerName]
           ,[ActionName]
           ,[RightId]
           ,[RoutePath]
           ,[DisplayOrder]
           ,[IsActive]
           ,[ModuleDisplayOrder]
           ,[Description])

		  VALUES  ( 'Chat'
           ,'chatmessage'
           ,'update'
           ,3
           ,'/chatMessage'
           ,3
           ,1
           ,18
           ,'Teacher and student can chat with each other.')

		   