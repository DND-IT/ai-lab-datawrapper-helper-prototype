import fetch from "node-fetch"; // need to run via tsx or native fetch in newer node

async function test() {
  const token = "Es3XqKUhWJmexi9e68TkwvpwegMlHSDdXyXsIGfahxSRAFLgz1S8JyhgN9V9OoWr";
  // Create chart
  let res = await fetch("https://api.datawrapper.de/v3/charts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Test Chart",
      type: "d3-bars",
      theme: "tamedia-ohne-linien",
    })
  });
  let d = await res.json();
  const id = d.id;
  
  // Apply changes via PATCH
  await fetch(`https://api.datawrapper.de/v3/charts/${id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      metadata: {
        visualize: {
          "base-color": "#378EBD"
        }
      }
    })
  });

  let resGet = await fetch(`https://api.datawrapper.de/v3/charts/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });
  let dGet = await resGet.json();
  console.log(JSON.stringify(dGet.metadata.visualize, null, 2));
}

test();
