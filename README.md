# Cranberry #

A browser remake of my very first hackathon project, which was a prototyped synchronized Youtube player with chatroom.

# Features
* Chatroom with various commands
* Client player that is synchronized with a server's timer and YouTube ID

# Plugins used #
* Socket.IO for networking

# Chat commands
Command              | Description | Restrictions | Example
---------------------|------------ | ------------ | --------
/user [name]         | Sets your username to [name]. | [3, 10] characters. No whitespace. Must be unique in the chatroom. (No boB and BOB) | /user Bob
/play [YouTube link] | Sets the synchronized video to play [YouTube link]. | Video must exist, and cannot be private. | /play https://www.youtube.com/watch?v=A9HV5O8Un6k
/color [color]       | Sets your username color to [color]. | Hex and color names work. | /color AliceBlue
/query [milliseconds]| Sets your query interval to [milliseconds]. Every [milliseconds], the server is queried for video information. | Must be nonnegative int. | /query 0
/leeway [seconds]    | Sets your leeway time to [seconds]. After a query, if your video duration's difference with the server's time is different by [seconds], the video duration will be updated. | Must be nonnegative. | /leeway 5