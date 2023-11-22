import React, { useState, useEffect, useCallback } from "react";

// Debounce function
const debounce = (func, delay) => {
  let debounceTimer;

  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
};

// ListItem Component is created and is memoized. This takes in an item and a handleCheckBox function as props
const ListItem = React.memo(({ item, handleCheckBox, isSelected }) => (
  <div>
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => handleCheckBox(item.id)}
    />
    <li>
      <div> username : {item.username} </div>
      <div> email : {item.email} </div>
    </li>
  </div>
));

export default function App() {
  const [data, setData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  // We can use a Set datastructure instead of an Array to keep track of selected items' ids
  const [selectedIds, setSelectedIds] = useState(new Set());

  /* Original code */
  // const handleCheckBox = (id) => {
  //     console.log(id)
  //     let searchedDataCopy = JSON.parse(JSON.stringify(searchedData))
  //     searchedDataCopy.forEach((item) => {
  //         if(item.id === id){
  //             item.selected = !item.selected
  //         }
  //     })

  //     setSearchedData(searchedDataCopy)
  // }

  // We can use useCallback on handleCheckBox to prevent unnecessary re-renders with selectedIds as a dependency. handleCheckBox will only be re-created if selectedIds changes and ListItem component which has a dependancy on handleCheckBox wont rerender unnecessarily.
  const handleCheckBox = useCallback(
    (id) => {
      // Sets have more efficient lookups than using loops on Arrays for large data
      let newSelectedIds = new Set(selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      setSelectedIds(newSelectedIds);
    },
    [selectedIds],
  );

  const handleDeleteClick = () => {
    let remainingNames = searchedData.filter(
      (item) => !selectedIds.has(item.id),
    );
    setSearchedData(remainingNames);
    setSelectedIds(new Set());
  };

  /* Original code */
  // const handleSearchChange = (e) => {
  //     setSearchInput(e.target.value)
  //     let filteredData = data.filter((item) => {
  //         return item.username.toLowerCase().includes(e.target.value.toLowerCase()) || item.email.toLowerCase().includes(e.target.value.toLowerCase())
  //     })
  //     setSearchedData(filteredData)
  // }

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    debouncedHandleSearchChange(e.target.value);
  };

  const handleSearchChange = (value) => {
    if (!value) {
      setSearchedData(data);
      return;
    }
    let filteredData = searchedData.filter((item) => {
      return (
        item.username.toLowerCase().includes(value.toLowerCase()) ||
        item.email.toLowerCase().includes(value.toLowerCase())
      );
    });
    setSearchedData(filteredData);
  };

  // When we have a very large data array, we can use the debounce function that will wait before calling the handleSearchChange function. This will prevent the function from being called too often. Hence optimizing the performance.
  const debouncedHandleSearchChange = debounce(handleSearchChange, 300);

  /* Original code */
  // useEffect(() => {
  //     if(!searchedData.every((item) => item.selected === false)){
  //         setShowDelete(true)
  //     }
  // }, [searchedData])
  useEffect(() => {
    // instead of looping through the entire searchedData array, we can just use the selectedIds Set and check its size
    setShowDelete(selectedIds.size > 0);
  }, [selectedIds]);

  useEffect(() => {
    const callAPI = async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users",
      );
      const result = await response.json();
      setData(result);
      let resultCopy = JSON.parse(JSON.stringify(result));
      resultCopy.forEach((item) => {
        item.selected = false;
      });
      setSearchedData(resultCopy);
    };

    callAPI();
  }, []);

  return (
    <div>
      <input type="text" value={searchInput} onChange={handleInputChange} />
      {showDelete === true && <div onClick={handleDeleteClick}> X </div>}
      {/* To prevent unnecessary re-renders when the selectedIds Set changes, we can pass only the selected status of each item. This way only the ListItem component of the items that are selected or deselected will re-render */}
      <ul>
        {searchedData.map((item, index) => (
          <ListItem
            key={item.key}
            item={item}
            handleCheckBox={handleCheckBox}
            isSelected={selectedIds.has(item.id)}
          />
        ))}
      </ul>
    </div>
  );
}
