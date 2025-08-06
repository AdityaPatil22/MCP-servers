import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardTitle, Alert, Skeleton } from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';
import './index.css';
import QueryForm from './components/QueryForm';
import AnalysisSection from './components/AnalysisSection';
import ToolsList from './components/ToolsList';
// MCP Client configuration
const MCP_CLIENT_URL = 'http://localhost:3000'; // Update with your MCP client port

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  const parseResponse = (response) => {
    if (!response) return null;
    
    const toolCallMatches = response.match(/\[Calling tool (.*?) with args (.*?)\]/g) || [];
    const toolCalls = toolCallMatches.map((call) => {
      const match = call.match(/\[Calling tool (.*?) with args (.*?)\]/);
      return match ? { tool: match[1], args: match[2] } : null;
    }).filter(Boolean);

    const toolResults = response.split('Tool result:').slice(1).map((result) => {
      const parts = result.split('Analysis:');
      return { result: parts[0].trim(), analysis: parts[1]?.trim() || '' };
    });

    return { toolCalls, toolResults, rawResponse: response };
  };

  const sendQuery = useMutation({
    mutationFn: async (query) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${MCP_CLIENT_URL}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        const responseData = await response.json();
        setConversationHistory((prev) => [...prev, {
          query,
          response: responseData.response,
          timestamp: new Date().toISOString(),
          parsedResponse: parseResponse(responseData.response),
        }]);

        return responseData;
      } catch (error) {
        setError(error.message || 'An error occurred while processing your query');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleFormSubmit = () => {
    if (!userInput.trim()) {
      setError('Please enter a query');
      return;
    }

    const currentQuery = userInput;
    setUserInput('');
    sendQuery.mutate(currentQuery);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar with Tools */}
      <div className="w-80 bg-white shadow-lg border-r flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          <ToolsList mcpClientUrl={MCP_CLIENT_URL} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center pr-4">
        <img src="/mesh.png" alt="Scarlet Mesh" className="w-8 h-8 mr-2" />
          <h1 className="text-xl font-semibold text-gray-800">Scarlet Mesh Assistant</h1>
        </div>
        {/* Chat Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {conversationHistory.map((interaction, index) => (
              <div key={index} className="mb-6">
                {/* User Query */}
                <Card className="mb-2 border-l-4 border-blue-500">
                  <CardBody>
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        <span>Q</span>
                      </div>
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{interaction.query}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(interaction.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Assistant Response */}
                <Card className="border-l-4 border-green-500">
                  <CardBody>
                    <div className="flex items-start">
                      <div className="bg-green-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        <span>A</span>
                      </div>
                      <div className="flex-1">
                        {/* Display raw response if no structured data found */}
                        {!interaction.parsedResponse?.toolCalls.length &&
                          !interaction.parsedResponse?.toolResults.length && (
                            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                              {interaction.response}
                            </div>
                          )}

                        {/* Display structured tool calls if found */}
                        {interaction.parsedResponse?.toolCalls.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-bold text-lg mb-2">
                              Tool Calls:
                            </h3>
                            <div className="space-y-2">
                              {interaction.parsedResponse.toolCalls.map(
                                (call, callIndex) => (
                                  <div
                                    key={callIndex}
                                    className="bg-gray-50 p-3 rounded"
                                  >
                                    <p className="font-medium">
                                      Tool:{' '}
                                      <span className="text-blue-600">
                                        {call.tool}
                                      </span>
                                    </p>
                                    <p className="mt-1">
                                      Arguments:{' '}
                                      <span className="font-mono">
                                        {call.args}
                                      </span>
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="mt-4">
                <Card className="border-l-4 border-green-500">
                  <CardBody>
                    <div className="flex items-start">
                      <div className="bg-green-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        <span>A</span>
                      </div>
                      <div className="flex-1">
                        <Skeleton width="75%" />
                        <br />
                        <Skeleton width="50%" />
                        <br />
                        <Skeleton />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto p-4">
            {/* Error Alert */}
            {error && (
              <div className="mb-4">
                <Alert variant="danger" title="Error">
                  {error}
                </Alert>
              </div>
            )}

            {/* Query Form */}
            <QueryForm
              userInput={userInput}
              setUserInput={setUserInput}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>

        {/* Analysis Section - Fixed at bottom */}
        <div className="bg-white border-t">
          <div className="max-w-4xl mx-auto p-4">
            {conversationHistory.length > 0 && (
              <div className="space-y-4">
                {conversationHistory[conversationHistory.length - 1]?.parsedResponse?.toolResults.map(
                  (item, resultIndex) => (
                    <div key={resultIndex}>
                      {item.analysis && (
                        <AnalysisSection
                          analysisContent={item.analysis}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
