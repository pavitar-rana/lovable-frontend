import { LucideSend } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import { Textarea } from "../ui/textarea";

const PromptInputComp = ({
  userPrompt,
  setUserPrompt,
  handleChat,
}: {
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  userPrompt: string;
  handleChat: any;
}) => {
  return (
    <Card className="focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
      <CardContent className="flex justify-between items-center w-full">
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="bg-transparent px-3 py-2 w-full resize-none focus:outline-none"
          placeholder="Type your message..."
        />
        <Button onClick={handleChat}>
          <LucideSend />
        </Button>
      </CardContent>
    </Card>
  );
};

export { PromptInputComp };
