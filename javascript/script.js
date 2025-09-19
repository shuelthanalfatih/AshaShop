//Animationn list-hamburger in Navbar
const listBar = document.querySelector(".list-bar");
const navSlide = document.querySelector("nav ul");

listBar.addEventListener("click", () => {
  navSlide.classList.toggle("slide");
  listBar.classList.toggle("open")
});

// Animation
const animation = document.querySelectorAll(".animation");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("show", entry.isIntersecting);
    if(entry.isIntersecting) observer.unobserve(entry.target)
  });
}, {
  // root:  we recomended dont use this property, because we want in entire element(HTML)
  // threshold: 0.1, // we use this to tell browser, make this el appear, if this touch 90% from teh screen
  rootMargin: "0px 0px -20px 0px", // this is use for px form top left bottom right
});

animation.forEach(el => {
  observer.observe(el);

})
