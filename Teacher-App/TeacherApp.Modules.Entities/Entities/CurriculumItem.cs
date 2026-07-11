using System;
using System.Collections.Generic;
using Newtonsoft.Json;

public class CurriculumItem
{
    public string Grade { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Source { get; set; } = "";
    public string Domain_Title { get; set; } = "";
    public string Lesson_Number { get; set; } = "";
    public string Lesson_Title { get; set; } = "";
    public List<string> Topics { get; set; } = new List<string>();
    public List<string> Standards { get; set; } = new List<string>();
    public string Standard { get; set; } = "";
    public string Standards_Details { get; set; } = "";
    public List<string> Standards_Activities { get; set; } = new List<string>();
    public List<string> Standards_Assessments { get; set; } = new List<string>();
    public List<string> Standards_Materials { get; set; } = new List<string>();
    public string Standards_Anticipatory_Set { get; set; } = "";
    public string Standards_Objective_Purpose { get; set; } = "";
    public List<string> Standards_Input { get; set; } = new List<string>();
    public List<string> Standards_Model { get; set; } = new List<string>();
    public List<string> Check_for_Understanding { get; set; } = new List<string>();
    public List<string> Guided_Practice { get; set; } = new List<string>();
    public List<string> Closure { get; set; } = new List<string>();
    public List<string> Independent_Practice { get; set; } = new List<string>();
}