import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import clsx from "clsx";
import { Button } from './Button';
import { Calendar } from './Calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './Popover';

export const DateRangePicker = ({
    value,
    onChange,
    placeholder = "Select Time Frame",
    className
}) => {
    const handleSelect = (range) => {
        onChange({
            from: range?.from,
            to: range?.to
        });
    };

    return (
        <div className={clsx("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={clsx(
                            "justify-start text-left font-normal",
                            !value.from && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} -{" "}
                                    {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value.from}
                        selected={{ from: value.from, to: value.to }}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                        className={clsx("p-3 pointer-events-auto")}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
