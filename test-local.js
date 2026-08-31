const cookie = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbXQ4ZzBqemkwMDAwbmJtb25ibHo1bmowIiwiZW1haWwiOiJhZG1pbkBub3JhLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc4ODE4MzkzMCwiZXhwIjoxNzg4Nzg4NzMwfQ.QwGLJISkM75LPi9TTNANZRc5cyUrSZJQgf6NUxSlMW4';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/products', {
      headers: {
        'Cookie': `session=${cookie}`
      }
    });

    const text = await res.text();
    console.log(`STATUS: ${res.status}`);
    console.log(text.substring(0, 1000));
  } catch (err) {
    console.error(err);
  }
}

test();
