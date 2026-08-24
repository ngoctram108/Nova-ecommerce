const query = 'Pijama';
fetch(`https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
  query
)}&gsrlimit=3&prop=pageimages&pithumbsize=800&format=json&origin=*`)
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
