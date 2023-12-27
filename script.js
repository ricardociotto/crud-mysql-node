document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('input[type="submit"]').addEventListener("click", showAlert);
});
function showAlert() {
    alert("its working");
}
