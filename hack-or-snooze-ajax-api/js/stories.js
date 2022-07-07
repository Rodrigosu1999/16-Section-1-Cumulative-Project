"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showFav = Boolean(currentUser);

  const favOrNoFav = showFav && currentUser.favorites.some(s => (s.storyId === story.storyId));
  console.log(favOrNoFav);
  const showFavClass = favOrNoFav ? "fav" : "no-fav";
  const checkOrNoCheck = favOrNoFav? "checked": "";

  let storyHtml= null;

 if (showFav) {
    storyHtml = $(`
    <li id="${story.storyId}" class="${showFavClass}">
      <input type="checkbox" name="" class="favorite" ${checkOrNoCheck}>
      <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <button class="delete-button">X</button>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
  } else {
    storyHtml = $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
  }
  return storyHtml;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


//We create a new story with the data from the submit form
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const user = currentUser;
  const title = $("#upload-title").val();
  const author = $("#upload-author").val();
  const url = $("#upload-url").val();

  const newStory = await storyList.addStory(user, { title, author, url });

  return newStory;
}

$uploadForm.on("submit", submitNewStory);


//Here we are adding the functionality for the favorite checkbox
async function  handleFav (evt){
  console.debug("handleFav")
  const $target = $(evt.target);
  const $li = $target.parent();
  const storyId = $li.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($li.hasClass("fav")) {
    // currently a favorite
    await currentUser.removeFavorite(story);
    $li.removeClass("fav").addClass("no-fav");

  } else {
    // currently not a favorite
    await currentUser.addFavorite(story);
    $li.removeClass("no-fav").addClass("fav");
  }
}

$allStoriesList.on("click", "input", handleFav);


function putFavStoriesOnPage() {
  console.debug("putFavStoriesOnPage");

  $favStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
  }

  $favStoriesList.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $li = $(evt.target).parent();
  const storyId = $li.attr("id");
  try {
    await storyList.removeStory(currentUser, storyId);
    putStoriesOnPage();
  } catch (error) {
    alert("The story has to be made by the current user");
  }
}

$allStoriesList.on("click", "button", deleteStory);
