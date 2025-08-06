import { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Alert, Skeleton, Badge, ExpandableSection } from '@patternfly/react-core';

const ToolsList = ({ mcpClientUrl }) => {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedServers, setExpandedServers] = useState({});

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${mcpClientUrl}/tools`);
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        
        const toolsData = await response.json();
        setTools(toolsData);
        
        // Auto-expand all servers initially
        const serverNames = [...new Set(toolsData.map(tool => tool.server_name || 'Unknown Server'))];
        const initialExpanded = {};
        serverNames.forEach(serverName => {
          initialExpanded[serverName] = true;
        });
        setExpandedServers(initialExpanded);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, [mcpClientUrl]);

  const toggleServerExpansion = (serverName) => {
    setExpandedServers(prev => ({
      ...prev,
      [serverName]: !prev[serverName]
    }));
  };

  // Group tools by server (fallback if server_name is missing)
  const toolsByServer = tools.reduce((acc, tool) => {
    const serverName = tool.server_name || 'Unknown Server';
    if (!acc[serverName]) {
      acc[serverName] = [];
    }
    acc[serverName].push(tool);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card>
        <CardTitle>Available Tools</CardTitle>
        <CardBody>
          <Skeleton width="100%" />
          <br />
          <Skeleton width="80%" />
          <br />
          <Skeleton width="60%" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardTitle>Available Tools</CardTitle>
        <CardBody>
          <Alert variant="danger" title="Error loading tools">
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardTitle>Available MCP Servers</CardTitle>
      <CardBody className="p-0">
        <div className="max-h-[1100px] overflow-y-auto scrollbar-hide">
          {tools.length === 0 ? (
            <div className="p-4">
              <p className="text-gray-500">No tools available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(toolsByServer).map(([serverName, serverTools]) => (
                <div key={serverName} className="border-b border-gray-200 last:border-b-0">
                  <ExpandableSection
                    toggleText={
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-gray-800">{serverName}</span>
                        <Badge className="ml-2">{serverTools.length}</Badge>
                      </div>
                    }
                    isExpanded={expandedServers[serverName]}
                    onToggle={() => toggleServerExpansion(serverName)}
                    className="border-0"
                  >
                    <div className="pl-4 pb-3">
                      <ul className="space-y-1">
                        {serverTools.map((tool, index) => (
                          <li 
                            key={`${serverName}-${index}`} 
                            className=" text-sm hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            {tool.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ExpandableSection>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ToolsList;