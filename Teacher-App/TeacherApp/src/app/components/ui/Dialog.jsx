import React from "react";
import {
    Dialog as MuiDialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const Dialog=({
    open,
    onClose,
    title,
    children,
    onSave,
    saveText = "Save",
    cancelText = "Cancel",
    maxWidth = "sm",
    fullWidth = true,
})=> {
    return (
        <MuiDialog
            open={open}
            onClose={onClose}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pr: 2,
                }}
            >
                {title}
                <IconButton edge="end" color="inherit" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>{children}</DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {cancelText}
                </Button>
                {onSave && (
                    <Button variant="contained" onClick={onSave} color="primary">
                        {saveText}
                    </Button>
                )}
            </DialogActions>
        </MuiDialog>
    );
}
