/**
 * Lamatic GraphQL API integration
 */

const LAMATIC_API_URL = "https://tylsorganization131-yeongsproject667.lamatic.dev/graphql";
const LAMATIC_PROJECT_ID = "6e530d51-9376-458d-b8cf-82157ca410a6";
const LAMATIC_WORKFLOW_ID = "32cd511a-aebc-40c8-8ef9-5651a2d6be99"; // Chatbot Flow ID
const LAMATIC_ASSESSMENT_WORKFLOW_ID = "ca9eb213-7334-4e35-af34-7c05efca7f0b"; // Assessment Flow ID
const LAMATIC_PDF_WORKFLOW_ID = "8b6421e9-9ee3-4cbe-a350-51e2e1b6513a"; // PDF Generation Flow ID

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
export async function executeLamaticWorkflow(messages: Message[], role?: string, userId?: string): Promise<string> {
  // Hardcoded API key for testing
  const apiKey = "lt-5db2bed98bbb35ff402e860f1179879b";
  
  // Uncomment below to use environment variable instead:
  // const apiKey = import.meta.env.VITE_LAMATIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("LAMATIC_API_KEY is not set");
  }

  // Construct the query - wrap in "input" object
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
  
  // Add role if provided
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

/**
 * Execute Lamatic PDF workflow with session_id
 * Returns HTML content for PDF
 */
export async function executePDFWorkflow(sessionId: string): Promise<string> {
  // Hardcoded API key for testing
  const apiKey = "lt-5db2bed98bbb35ff402e860f1179879b";
  
  if (!apiKey) {
    throw new Error("LAMATIC_API_KEY is not set");
  }

  const query = `query ExecuteWorkflow($workflowId: String!, $session_id: String!) {
    executeWorkflow(
      workflowId: $workflowId
      payload: {
        session_id: $session_id
      }
    ) {
      status
      result
    }
  }`;

  const variables = {
    workflowId: LAMATIC_PDF_WORKFLOW_ID,
    session_id: sessionId
  };
  
  console.log("Lamatic PDF API request:", JSON.stringify({ query, variables }, null, 2));

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
      console.error("Lamatic PDF API error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
    }

    const data: LamaticResponse = await response.json();
    console.log("Lamatic PDF API response:", JSON.stringify(data, null, 2));

    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message);
    }

    const result = data.data?.executeWorkflow?.result;
    
    if (!result) {
      console.error("No result in API response. Full response:", JSON.stringify(data, null, 2));
      throw new Error("No result from Lamatic PDF API");
    }

    // Parse the result - should be HTML string
    // The API might return it as a string directly, or nested in various structures
    let htmlContent: string;
    
    // Check if result is already a string (HTML)
    if (typeof result === "string") {
      htmlContent = result;
    } 
    // Check if result has html property
    else if (result?.html) {
      htmlContent = typeof result.html === "string" ? result.html : JSON.stringify(result.html);
    } 
    // Check if result has output property (might be nested)
    else if (result?.output) {
      if (typeof result.output === "string") {
        htmlContent = result.output;
      } else if (result.output?.html) {
        htmlContent = result.output.html;
      } else {
        htmlContent = JSON.stringify(result.output);
      }
    }
    // Check if result has a pdf_html or html_content property
    else if (result?.pdf_html) {
      htmlContent = typeof result.pdf_html === "string" ? result.pdf_html : JSON.stringify(result.pdf_html);
    } else if (result?.html_content) {
      htmlContent = typeof result.html_content === "string" ? result.html_content : JSON.stringify(result.html_content);
    }
    // If result is an object, try to stringify it (might contain HTML)
    else {
      console.warn("Unexpected result structure:", JSON.stringify(result, null, 2));
      // Try to extract any string value that might be HTML
      const resultStr = JSON.stringify(result);
      // Check if it looks like HTML
      if (resultStr.includes("<html") || resultStr.includes("<!DOCTYPE")) {
        htmlContent = resultStr;
      } else {
        htmlContent = resultStr;
      }
    }

    // Remove markdown code block markers (```html ... ```)
    htmlContent = htmlContent.replace(/^```html\s*/i, "").replace(/\s*```$/g, "");
    htmlContent = htmlContent.replace(/^```\s*/i, "").replace(/\s*```$/g, "");
    
    // Trim any leading/trailing whitespace
    htmlContent = htmlContent.trim();

    // Extract body content and remove style tags
    let finalHtml = htmlContent;
    
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    
    if (bodyMatch) {
      // Extract body content
      finalHtml = bodyMatch[1].trim();
      
      // Remove any <style> tags from body content (they shouldn't be there but sometimes are)
      finalHtml = finalHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      
      // Remove page-break divs
      finalHtml = finalHtml.replace(/<div[^>]*class=["\']page-break["\'][^>]*>[\s\S]*?<\/div>/gi, '');
      
      console.log("Extracted body content and removed style tags");
    } else {
      console.warn("Could not find <body> tags, using full HTML");
      // Still try to remove style tags even if no body found
      finalHtml = finalHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    }

    console.log("Final HTML content length:", finalHtml.length);
    console.log("HTML preview (first 200 chars):", finalHtml.substring(0, 200));

    return finalHtml;
  } catch (error) {
    console.error("Lamatic PDF API error:", error);
    throw error;
  }
}
