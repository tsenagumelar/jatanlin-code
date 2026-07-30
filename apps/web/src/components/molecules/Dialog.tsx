import React from "react";
import {
  Dialog as FluentDialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  DialogProps,
} from "@fluentui/react-components";

export interface CustomDialogProps extends Omit<DialogProps, "children"> {
  trigger?: React.ReactElement;
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<CustomDialogProps> = ({
  trigger,
  title,
  content,
  actions,
  ...props
}) => {
  const dialogContent = (
    <DialogSurface>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogBody>
        {content ? <DialogContent>{content}</DialogContent> : null}
      </DialogBody>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </DialogSurface>
  );

  if (!trigger) {
    return <FluentDialog {...props}>{dialogContent}</FluentDialog>;
  }

  return (
    <FluentDialog {...props}>
      <DialogTrigger disableButtonEnhancement>{trigger}</DialogTrigger>
      {dialogContent}
    </FluentDialog>
  );
};

export default Dialog;
