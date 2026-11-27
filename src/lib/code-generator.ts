import type { ApiEndpoint } from '../types/doc';

export function generateCodeSnippet(
  endpoint: ApiEndpoint,
  language: 'curl' | 'javascript' | 'python' | 'go' | 'php',
  customValues: {
    baseUrl?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    pathParams?: Record<string, string>;
    body?: string;
  } = {}
): string {
  const method = endpoint.method;
  const baseUrl = customValues.baseUrl || endpoint.baseUrl || 'https://api.example.com';

  // Replace path params
  let path = endpoint.path;
  if (customValues.pathParams) {
    Object.entries(customValues.pathParams).forEach(([key, val]) => {
      path = path.replace(`:${key}`, val || `:${key}`);
    });
  }

  // Build query string
  let queryStr = '';
  if (customValues.queryParams && Object.keys(customValues.queryParams).length > 0) {
    const q = new URLSearchParams(customValues.queryParams).toString();
    if (q) queryStr = `?${q}`;
  }

  const fullUrl = `${baseUrl}${path}${queryStr}`;

  // Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customValues.headers || {}),
  };
  endpoint.headers?.forEach((h) => {
    if (!headers[h.name] && h.example) {
      headers[h.name] = h.example;
    }
  });

  const bodyData = customValues.body || endpoint.requestBodySchema || '';

  switch (language) {
    case 'curl': {
      let cmd = `curl -X ${method} "${fullUrl}"`;
      Object.entries(headers).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyData.trim()) {
        cmd += ` \\\n  -d '${bodyData.trim()}'`;
      }
      return cmd;
    }

    case 'javascript': {
      const headerObj = JSON.stringify(headers, null, 4);
      let snippet = `const response = await fetch("${fullUrl}", {\n`;
      snippet += `  method: "${method}",\n`;
      snippet += `  headers: ${headerObj},\n`;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyData.trim()) {
        snippet += `  body: JSON.stringify(${bodyData.trim()}),\n`;
      }
      snippet += `});\n\nconst data = await response.json();\nconsole.log(data);`;
      return snippet;
    }

    case 'python': {
      let snippet = `import requests\n\nurl = "${fullUrl}"\n`;
      snippet += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyData.trim()) {
        snippet += `payload = ${bodyData.trim()}\n\n`;
        snippet += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
      } else {
        snippet += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
      }
      snippet += `print(response.status_code)\nprint(response.json())`;
      return snippet;
    }

    case 'go': {
      let snippet = `package main\n\nimport (\n\t"bytes"\n\t"fmt"\n\t"io"\n\t"net/http"\n)\n\nfunc main() {\n`;
      snippet += `\turl := "${fullUrl}"\n`;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyData.trim()) {
        snippet += `\tpayload := []byte(\`${bodyData.trim()}\`)\n`;
        snippet += `\treq, err := http.NewRequest("${method}", url, bytes.NewBuffer(payload))\n`;
      } else {
        snippet += `\treq, err := http.NewRequest("${method}", url, nil)\n`;
      }
      snippet += `\tif err != nil {\n\t\tpanic(err)\n\t}\n\n`;
      Object.entries(headers).forEach(([k, v]) => {
        snippet += `\treq.Header.Set("${k}", "${v}")\n`;
      });
      snippet += `\n\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(resp.Status)\n\tfmt.Println(string(body))\n}`;
      return snippet;
    }

    case 'php': {
      let snippet = `<?php\n\n$ch = curl_init();\n\n`;
      snippet += `curl_setopt($ch, CURLOPT_URL, "${fullUrl}");\n`;
      snippet += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
      snippet += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
      const headerList = Object.entries(headers).map(([k, v]) => `"${k}: ${v}"`);
      snippet += `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n    ${headerList.join(',\n    ')}\n]);\n`;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyData.trim()) {
        snippet += `curl_setopt($ch, CURLOPT_POSTFIELDS, '${bodyData.trim()}');\n`;
      }
      snippet += `\n$response = curl_exec($ch);\n$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\necho "HTTP " . $httpCode . "\\n" . $response;`;
      return snippet;
    }
  }
}
