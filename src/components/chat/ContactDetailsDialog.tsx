
import React from 'react';
import { Contact } from '@/types/chat';
import Avatar from '@/components/common/Avatar';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ContactDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}

const ContactDetailsDialog = ({ open, onOpenChange, contact }: ContactDetailsDialogProps) => {
  if (!contact) return null;
  
  const textDescription = contact?.accessInfo?.clientData?.['app-web-auth:description']?.content;

  // Helper function to render the permissions section
  const renderPermissions = () => {
    if (!contact || !contact.permissions) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>No permissions available</span>
          </div>
        </div>
      );
    }

    return (
      <>
        {contact.permissions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-3">Permissions</h3>
            {contact.permissions.map((permission, index) => (
              <div key={`perm-${index}`} className="flex justify-between">
                <span>{permission.name}</span>
                <div className="space-x-3">
                  <span key={`cat-${index}`} className="text-primary">
                    {permission.category}
                  </span>
                  {permission.actions.map((action, actionIndex) => (
                    <span key={`action-${index}-${actionIndex}`} className="text-muted-foreground text-sm">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222] text-white border-gray-800 sm:max-w-md">
        <DialogTitle className="sr-only">Contact Details</DialogTitle>
        <div className="flex flex-col items-center mb-4">
          <Avatar 
            name={contact.displayName}
            src={contact.avatarUrl}
            className="h-24 w-24 mb-4" 
          />
          <h2 className="text-xl font-bold">{contact.displayName}</h2>
          
          {contact?.accessInfo?.type && (
            <p className="text-muted-foreground mt-1">
              Type: {contact.accessInfo.type}
            </p>
          )}

          {textDescription && (
            <p className="text-white mt-1">
              {textDescription}
            </p>
          )}
        </div>
        
        <Separator className="my-4 bg-gray-800" />
        
        {renderPermissions()}
        
        <div className="mt-6 flex justify-end">
          <button className="flex items-center text-red-500 hover:text-red-400">
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Connection
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsDialog;
