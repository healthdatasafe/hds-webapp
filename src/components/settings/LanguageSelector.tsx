
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/context/TranslationContext';

const languageNames: Record<string, string> = {
  en: "English",
  fr: "Français",
};

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Language</label>
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Languages</SelectLabel>
            {availableLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {languageNames[lang] || lang}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
