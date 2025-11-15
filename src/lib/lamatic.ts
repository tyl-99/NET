/**
 * Lamatic GraphQL API integration
 */

const LAMATIC_API_URL = "https://tylsorganization131-yeongsproject667.lamatic.dev/graphql";
const LAMATIC_PROJECT_ID = "6e530d51-9376-458d-b8cf-82157ca410a6";
const LAMATIC_WORKFLOW_ID = "32cd511a-aebc-40c8-8ef9-5651a2d6be99"; // Chatbot Flow ID
const LAMATIC_ASSESSMENT_WORKFLOW_ID = "ca9eb213-7334-4e35-af34-7c05efca7f0b"; // Assessment Flow ID

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LamaticResponse {
  data?: {
    executeWorkflow?: {
      status: string;
      result?: {
        output?: {
          generatedResponse?: string;
        };
      };
    };
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * Execute Lamatic workflow with conversation messages
 */
export async function executeLamaticWorkflow(messages: Message[], role?: string): Promise<string> {
  // Hardcoded API key for testing
  const apiKey = "lt-5db2bed98bbb35ff402e860f1179879b";
  
  // Uncomment below to use environment variable instead:
  // const apiKey = import.meta.env.VITE_LAMATIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("LAMATIC_API_KEY is not set");
  }

  // Construct the query - try passing input as a variable
  // The API might accept input as a JSON object variable
  const query = `query ExecuteWorkflow($workflowId: String!, $input: JSON) {
    executeWorkflow(
      workflowId: $workflowId
      payload: {
        input: $input
      }
    ) {
      status
      result
    }
  }`;

  const input: any = {
    messages: messages
  };
  
  // Add role as separate key-value if provided
  if (role) {
    input.role = role;
  }

  const variables = {
    workflowId: LAMATIC_WORKFLOW_ID,
    input: input
  };
  
  // Log the request for debugging
  const requestBody = { query, variables };
  console.log("Lamatic API request:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(LAMATIC_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "x-project-id": LAMATIC_PROJECT_ID,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lamatic API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
    }

    const data: LamaticResponse = await response.json();
    console.log("Lamatic API response:", JSON.stringify(data, null, 2));

    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message);
    }

    const result = data.data?.executeWorkflow?.result;
    
    if (!result) {
      throw new Error("No result from Lamatic API");
    }

    // The result might be a JSON string that needs parsing
    let parsedResult: any;
    if (typeof result === "string") {
      try {
        parsedResult = JSON.parse(result);
      } catch {
        // If it's not JSON, return as is
        return result;
      }
    } else {
      parsedResult = result;
    }

    // Try to extract the response from various possible structures
    // The API returns {"output": "..."} structure
    if (parsedResult?.output) {
      // If output is a string, return it directly
      if (typeof parsedResult.output === "string") {
        // Convert literal \n strings to actual newlines
        return parsedResult.output.replace(/\\n/g, '\n');
      }
      // If output is an object with generatedResponse
      if (parsedResult.output?.generatedResponse) {
        return parsedResult.output.generatedResponse;
      }
    }
    
    if (parsedResult?.generatedResponse) {
      return parsedResult.generatedResponse;
    }

    // If result is a string and not JSON, return it
    if (typeof result === "string") {
      return result;
    }

    // Last resort: stringify the result
    return JSON.stringify(parsedResult);
  } catch (error) {
    console.error("Lamatic API error:", error);
    throw error;
  }
}

/**
 * Execute Lamatic assessment workflow with assessment data
 * Schema: { status: "ongoing" | "done", chat: string, assessment: [{question: string, answer: string}] }
 */
export async function executeAssessmentWorkflow(assessmentData: {
  status: "ongoing" | "done";
  chat: string;
  assessment: Array<{ question: string; answer: string }>;
}): Promise<any> {
  // Hardcoded API key for testing
  const apiKey = "lt-5db2bed98bbb35ff402e860f1179879b";
  
  if (!apiKey) {
    throw new Error("LAMATIC_API_KEY is not set");
  }

  const query = `query ExecuteWorkflow($workflowId: String!, $input: JSON) {
    executeWorkflow(
      workflowId: $workflowId
      payload: {
        input: $input
      }
    ) {
      status
      result
    }
  }`;

  const variables = {
    workflowId: LAMATIC_ASSESSMENT_WORKFLOW_ID,
    input: assessmentData
  };
  
  console.log("Lamatic Assessment API request:", JSON.stringify({ query, variables }, null, 2));

  try {
    const response = await fetch(LAMATIC_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "x-project-id": LAMATIC_PROJECT_ID,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lamatic Assessment API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
    }

    const data: LamaticResponse = await response.json();
    console.log("Lamatic Assessment API response:", JSON.stringify(data, null, 2));

    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message);
    }

    const result = data.data?.executeWorkflow?.result;
    
    if (!result) {
      throw new Error("No result from Lamatic Assessment API");
    }

    // Parse the result
    let parsedResult: any;
    if (typeof result === "string") {
      try {
        parsedResult = JSON.parse(result);
      } catch {
        // If not JSON, return as is
        return result;
      }
    } else {
      parsedResult = result;
    }

    // Return the parsed result
    return parsedResult;
  } catch (error) {
    console.error("Lamatic Assessment API error:", error);
    throw error;
  }
}

