let scene, camera, renderer, stars, starGeo;
let mouseX = 0,
  mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJSBackground() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 1;
  camera.rotation.x = Math.PI / 2;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("three-js-background"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a0a, 1);

  // Create stars
  starGeo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 600 - 300;
    const y = Math.random() * 600 - 300;
    const z = Math.random() * 600 - 300;
    positions.push(x, y, z);

    const color = new THREE.Color();
    color.setHSL(0.7 + Math.random() * 0.1, 1.0, 0.7);
    colors.push(color.r, color.g, color.b);
  }

  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const sprite = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/circle.png"
  );
  const starMaterial = new THREE.PointsMaterial({
    size: 0.7,
    map: sprite,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);

  const nebulaGeometry = new THREE.SphereGeometry(200, 32, 32);
  const nebulaMaterial = new THREE.MeshBasicMaterial({
    color: 0x0a0d1b,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
  });
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  scene.add(nebula);

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateThreeJSBackground() {
  requestAnimationFrame(animateThreeJSBackground);

  camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  const positions = starGeo.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] += 0.5;
    if (positions[i + 2] > 200) {
      positions[i + 2] = -300;
    }
  }
  starGeo.attributes.position.needsUpdate = true;

  stars.rotation.z += 0.0005;

  renderer.render(scene, camera);
}

function setupProjectFilters() {
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
      button.classList.add("active-filter");

      const filterCategory = button.dataset.filter;

      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category;

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.pointerEvents = "none";

        setTimeout(() => {
          if (filterCategory === "all" || cardCategory === filterCategory) {
            card.style.display = "block";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
              card.style.pointerEvents = "auto";
            }, 50);
          } else {
            card.style.display = "none";
          }
        }, 300);
      });
    });
  });
}

window.onload = function () {
  initThreeJSBackground();
  animateThreeJSBackground();
  setupProjectFilters();

  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav .space-x-4 a");
  const navBar = document.querySelector("nav");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("active-nav-item"));
        const activeLink = document.querySelector(
          `nav a[href="#${entry.target.id}"]`
        );
        if (activeLink) activeLink.classList.add("active-nav-item");
      }
    });
  }, observerOptions);

  sections.forEach((section) => sectionObserver.observe(section));

  // ⬇️ Tambahkan di sini agar "home" aktif saat load
  setTimeout(() => {
    setActiveNavLink(); // Manual trigger on load
  }, 100); // Delay kecil agar layout sudah stabil

  function setActiveNavLink() {
    let currentActive = "home";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navBar.offsetHeight;
      const sectionHeight = section.clientHeight;
      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        currentActive = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active-nav-item");
      if (link.getAttribute("href").includes(currentActive)) {
        link.classList.add("active-nav-item");
      }
    });
  }

  window.addEventListener("scroll", setActiveNavLink);
  setActiveNavLink();

  // Smooth scroll
  document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelector(this.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth" });

      if (window.innerWidth <= 768) {
        const navLinksContainer = document.querySelector("nav .space-x-4");
        const menuToggle = document.querySelector(".menu-toggle");
        navLinksContainer.classList.remove("flex");
        navLinksContainer.classList.add("hidden");
        menuToggle.classList.remove("open");
        navBar.classList.remove("open");
      }
    });
  });

  // Mobile nav toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinksContainer = document.querySelector("nav .space-x-4");

  menuToggle.addEventListener("click", () => {
    navLinksContainer.classList.toggle("flex");
    navLinksContainer.classList.toggle("hidden");
    menuToggle.classList.toggle("open");
    navBar.classList.toggle("open");
  });
};
