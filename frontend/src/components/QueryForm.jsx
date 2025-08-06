import { Button, TextInput } from '@patternfly/react-core';

const QueryForm = ({ userInput, setUserInput, onSubmit }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <TextInput
          type="text"
          aria-label="Ask a question"
          placeholder="Ask a question..."
          value={userInput}
          onChange={(_event, value) => setUserInput(value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button variant="primary" onClick={onSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default QueryForm;
