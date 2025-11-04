import { LucideSend } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";

const PromptInputComp = ({
  userPrompt,
  setUserPrompt,
  handleChat,
  loading,
}: {
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  userPrompt: string;
  handleChat: any;
  loading: boolean;
}) => {
  return (
    <Card className="focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
      <CardContent className="flex justify-between items-center w-full">
        <textarea
          value={userPrompt}
          onChange={(e) => {
            setUserPrompt(e.target.value);
          }}
          className="bg-transparent px-3 py-2 w-full resize-none focus:outline-none"
          placeholder="Type your message..."
        />
        <Button
          type="submit"
          onClick={() => {
            setUserPrompt("");
            handleChat();
          }}
          disabled={loading}
        >
          {loading ? <Spinner /> : <LucideSend />}
        </Button>
      </CardContent>
    </Card>
  );
};

export { PromptInputComp };
