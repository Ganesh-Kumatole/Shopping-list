// Selecting required elements from DOM
const form = document.querySelector("form");
const inputItem = document.getElementById("input-item");
const addBtn = document.getElementById("add-btn");
const filter = document.querySelector("div.filter");
const list = document.querySelector("ul");
const clearAll = document.querySelector("div.clearAll");

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
  } else {
    const listItems = document.querySelectorAll("li");

    if (listItems.length == 0) {
      // Display Filter
      const filterIcon = createIcon("fa-solid fa-filter");
      const inputFilter = document.createElement("input");

      inputFilter.id = "input-filter";
      inputFilter.type = "text";
      inputFilter.placeholder = "Filter Items...";

      filter.append(filterIcon);
      filter.append(inputFilter);

      // Display ClearAll button
      const clearAllBtn = createButton("clearAll-btn");

      clearAllBtn.innerText = "Clear All";
      clearAll.append(clearAllBtn);
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
  }
}

form.addEventListener("submit", addToList);

// Note: Submit event can only be attached on <form> and gets trigerred only after the button within form is clicked.
