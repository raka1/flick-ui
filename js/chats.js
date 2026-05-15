let chats = {
  "chats": [
    {
      "id": 1,
      "participants": [
        1,
        2
      ],
      "messages": [
        {
          "id": 1,
          "sender": 1,
          "recipient": 2,
          "message": "Hello, Alice!",
          "content": null,
          "timestamp": "2022-01-01 09:00:00"
        },
        {
          "id": 2,
          "sender": 2,
          "recipient": 1,
          "message": "Hi! How are you?",
          "content": null,
          "timestamp": "2022-01-01 09:05:00"
        },
        {
          "id": 3,
          "sender": 1,
          "recipient": 2,
          "message": "I'm good, thanks. Just working on a project.",
          "content": null,
          "timestamp": "2022-01-01 09:10:00"
        }
      ]
    },
    {
      "id": 2,
      "participants": [
        1,
        3
      ],
      "messages": [
        {
          "id": 1,
          "sender": 1,
          "recipient": 3,
          "message": "Hey Bob! How's it going?",
          "content": null,
          "timestamp": "2022-01-01 09:15:00"
        },
        {
          "id": 2,
          "sender": 3,
          "recipient": 1,
          "message": "I'm doing well. What about you?",
          "content": null,
          "timestamp": "2022-01-01 09:20:00"
        }
      ]
    },
    {
      "id": 3,
      "participants": [
        1,
        4
      ],
      "messages": [
        {
          "id": 1,
          "sender": 1,
          "recipient": 4,
          "message": "Hi Emma! Long time no see. How have you been?",
          "content": null,
          "timestamp": "2022-01-01 09:25:00"
        },
        {
          "id": 2,
          "sender": 4,
          "recipient": 1,
          "message": "I've been great. Busy with work lately.",
          "content": null,
          "timestamp": "2022-01-01 09:30:00"
        }
      ]
    }
  ]
}
export const getChats = () => chats
export const setChats = (value) => {
  chats = value
}