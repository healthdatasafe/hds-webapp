
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import Avatar from '../common/Avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MessageProps {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  showAvatar?: boolean;
  hasForm?: boolean;
  formCompleted?: boolean;
  formType?: 'symptomReport' | 'medicationReport' | 'feedbackForm';
}

const Message = ({ 
  id, 
  senderId, 
  content, 
  timestamp, 
  showAvatar = true, 
  hasForm = false,
  formCompleted = false,
  formType
}: MessageProps) => {
  const { currentUser } = useAuth();
  const { contacts, completeMessageForm } = useChat();
  const [formOpen, setFormOpen] = useState(false);
  
  const isCurrentUser = currentUser?.id === senderId;
  const sender = contacts.find(contact => contact.id === senderId) || {
    displayName: isCurrentUser ? currentUser?.displayName || 'You' : 'Unknown',
    avatarUrl: undefined
  };
  
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Form handling
  const form = useForm({
    defaultValues: {
      input1: '',
      input2: '',
    },
  });

  const handleFormSubmit = (values: any) => {
    completeMessageForm(id);
    setFormOpen(false);
    toast.success("Form submitted successfully");
  };

  const handleOpenForm = () => {
    setFormOpen(true);
  };

  return (
    <div className={cn(
      "flex items-end gap-2 mb-3",
      isCurrentUser ? "flex-row-reverse" : ""
    )}>
      {showAvatar && !isCurrentUser ? (
        <Avatar name={sender.displayName} src={sender.avatarUrl} className="h-10 w-10" />
      ) : null}
      
      <div className="flex flex-col max-w-[75%]">
        {!isCurrentUser && showAvatar && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {sender.displayName}
          </span>
        )}
        
        <div className={cn(
          "px-4 py-2 break-words",
          isCurrentUser 
            ? "bg-[#893228] text-white rounded-2xl rounded-tr-none" 
            : "bg-[#444] text-white rounded-2xl rounded-tl-none"
        )}>
          <div className="flex items-start">
            <div className="flex-1">{content}</div>
            {hasForm && formCompleted && (
              <div className="ml-2 flex items-center">
                <Check size={16} className="text-green-400" />
              </div>
            )}
          </div>
          
          {hasForm && !formCompleted && !isCurrentUser && (
            <Button 
              onClick={handleOpenForm}
              variant="secondary" 
              size="sm"
              className="mt-2 bg-white/10 hover:bg-white/20 text-white"
            >
              Fill Form
            </Button>
          )}
        </div>
        
        <span className={cn(
          "text-xs text-muted-foreground mt-1",
          isCurrentUser ? "text-right mr-1" : "ml-1"
        )}>
          {time}
        </span>
        
        {/* Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="bg-[#222] text-white border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-center">
                {formType === 'symptomReport' ? 'Report Symptoms' : 
                 formType === 'medicationReport' ? 'Medication Details' : 
                 'Feedback Form'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="input1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {formType === 'symptomReport' ? 'Symptom Description' : 
                         formType === 'medicationReport' ? 'Medication Name' : 
                         'Your Feedback'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#333] border-gray-700 text-white" 
                          placeholder="Enter details..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="input2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {formType === 'symptomReport' ? 'Severity (1-10)' : 
                         formType === 'medicationReport' ? 'Dosage' : 
                         'Suggestions for Improvement'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#333] border-gray-700 text-white" 
                          placeholder="Enter details..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Message;
