import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Plus, Trash2, BookOpen, Calendar } from 'lucide-react';

export const LessonEditor = ({ data, onChange }) => {
    const updateField = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const updateArrayField = (field, index, value) => {
        const newArray = [...data[field]];
        newArray[index] = value;
        updateField(field, newArray);
    };

    const addArrayItem = (field) => {
        const newArray = [...data[field], ''];
        updateField(field, newArray);
    };

    const removeArrayItem = (field, index) => {
        const newArray = data[field].filter((_, i) => i !== index);
        updateField(field, newArray);
    };

    const renderArrayField = (field, label) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="space-y-2">
                {data[field].map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            value={item}
                            onChange={(e) => updateArrayField(field, index, e.target.value)}
                            placeholder={`Enter ${label.toLowerCase()} item`}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem(field, index)}
                            className="px-3"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(field)}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {label.slice(0, -1)}
                </Button>
            </div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Lesson Plan Editor
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.Date}
                            onChange={(e) => updateField('Date', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chapterNo" className="text-sm font-medium">Chapter Number</Label>
                        <Input
                            id="chapterNo"
                            type="number"
                            value={data.ChapterNo}
                            onChange={(e) => updateField('ChapterNo', parseInt(e.target.value) || 0)}
                            placeholder="Enter chapter number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="standards" className="text-sm font-medium">Standards</Label>
                        <Input
                            id="standards"
                            value={data.Standards}
                            onChange={(e) => updateField('Standards', e.target.value)}
                            placeholder="e.g., 3.NBT.1-3"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
         

                
                    <div className="space-y-2">
                        <Label htmlFor="domain" className="text-sm font-medium">Domain</Label>
                        <Input
                            id="domain"
                            value={data.Domain}
                            onChange={(e) => updateField('Domain', e.target.value)}
                            placeholder="e.g., Number and Operations in Base Ten (3.NBT)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                        <Input
                            id="title"
                            value={data.Title}
                            onChange={(e) => updateField('Title', e.target.value)}
                            placeholder="Enter lesson title"
                        />
                    </div>
                
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                    <Textarea
                        id="content"
                        value={data.Content}
                        onChange={(e) => updateField('Content', e.target.value)}
                        placeholder="Enter lesson content description"
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderArrayField('KeyTopics', 'Key Topics')}
                    {renderArrayField('Activities', 'Activities')}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderArrayField('Assessments', 'Assessments')}
                    {renderArrayField('Material', 'Materials')}
                </div>

                {/*<div className="space-y-2">*/}
                {/*    <Label className="text-sm font-medium">JSON Preview:</Label>*/}
                {/*    <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-64 whitespace-pre-wrap">*/}
                {/*        {JSON.stringify(data, null, 2)}*/}
                {/*    </pre>*/}
                {/*</div>*/}
            </CardContent>
        </Card>
    );
};
