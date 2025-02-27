export async function GET(request) {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    // Process the request
    const users = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];
    
    // Return a Response object
    return Response.json({ users });
  }
  
  export async function POST(request) {
    // Get the request body
    const body = await request.json();
    
    // Process the request
    // ...
    
    // Return a Response object
    return Response.json({ status: 'success', message: 'User created' });
  }