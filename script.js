// Selecting required elements from DOM
const form = document.querySelector("form");
const inputItem = document.getElementById("input-item");
const addBtn = document.getElementById("add-btn");
const filter = document.querySelector("div.filter");
const list = document.querySelector("ul");
const clearBtn = document.querySelector("div.clearAll button#clear-btn");

function createButton(id) {
  const btn = document.createElement("button");
  btn.id = id;
  return btn;
}

function createIcon(classes) {
  const icon = document.createElement("i");
  icon.className = classes;
  return icon;
}

function addToList(e) {
  // Preventing default form submission
  e.preventDefault();

  // Validating the input
  if (inputItem.value == "") {
    alert("Item cannot be empty");
    return;
  }

  // Insert into list
  const li = document.createElement("li");
  const p = document.createElement("p");
  const cancelBtn = createButton("cancel-btn");
  const cancelIcon = createIcon("fa-solid fa-xmark");

  cancelBtn.append(cancelIcon);

  p.className = "item-name";
  p.textContent = inputItem.value;

  li.append(p);
  li.append(cancelBtn);

  document.querySelector("ul").append(li);

  inputItem.value = "";

  // Reset UI
  resetUI();
}

function cancelItem(e) {
  // Target cancelIcon & traverse up till item, then remove
  if (e.target.className === "fa-solid fa-xmark") {
    e.target.parentElement.parentElement.remove();
  }

  // Reset UI
  resetUI();
}

function clearItems(e) {
  const listItems = document.querySelectorAll("ul li");
  listItems.forEach((item) => {
    item.remove();
  });

  // Reset UI
  resetUI();
}

function resetUI() {
  if (list.querySelectorAll("ul li").length === 0) {
    filter.style.display = "none";
    clearBtn.style.display = "none";
  } else {
    filter.style.display = "flex";
    clearBtn.style.display = "block";
  }
}

form.addEventListener("submit", addToList);
list.addEventListener("click", cancelItem);
clearBtn.addEventListener("click", clearItems);
resetUI();
