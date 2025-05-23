import { Button } from "@radix-ui/themes";
import { HeartIcon } from "@radix-ui/react-icons";
function SelectedText({ selectedText, captureLanguage }) {
  return (
    <div className="flex items-center  text-white bg-radix-grass/80 mb-4 backdrop-blur-lg rounded-lg text-center py-2">
      <span className="flex-1 text-[20px]">
        {selectedText || "Highlight text to capture language"}
      </span>
      <Button
        onClick={captureLanguage}
        radius="full"
        color="orange"
        disabled={!selectedText}
        style={{
          color: "white",
          marginRight: "8px",
        }}
      >
        <HeartIcon /> Capture
      </Button>
    </div>
  );
}

export default SelectedText;
