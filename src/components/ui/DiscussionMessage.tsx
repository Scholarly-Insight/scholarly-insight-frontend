"use client";
import { Key, useState } from "react";
import { CommentReply, DiscussionEntry } from "../../types/discussion";
import { format } from "date-fns";
import ReplyMessage from "../ui/ReplyMessage";

import { sendReplyData } from "../../services/discussionService";

export default function DiscussionMessage(props: {
    comment : DiscussionEntry;
}) {
  const [value, setValue] = useState("");

  const [replies, setReplies] = useState<CommentReply[]>(
    props.comment.replies ? props.comment.replies : []
  );

  async function handle() {
    const reply = {
      id: "reply1",
      articleId: props.comment.articleId,
      message: value,
      username: "John Doe",
      timestamp: Date.now(),
    }
    
    sendReplyData(props.comment.articleId, reply)

    setReplies((oldArray) => [...oldArray, reply]);

    setValue("");
  }

  return (
    <div className="w-full flex-col mb-0 justify-self-center p-4 text-gray-800 dark:text-white">

      <div className="flex-col rounded bg-gray-100 p-3">
        <h2 className="bold text-gray-800 dark:text-white"><strong>{props.comment.username}</strong> • {format(props.comment.timestamp, 'MMMM d, yyyy')}</h2>

        <h2 className="mt-2 mb-4">
            {props.comment.message}
        </h2>

        {replies.map((replyparam: CommentReply, index: Key | null | undefined) => (
          <ReplyMessage key={index} reply={replyparam}></ReplyMessage>
        ))}

        <div className="flex items-center">

          <textarea
            id="sendReply"
            rows={1}
            className="mx-2 block w-3/4 mt-4 ml-5 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Type a reply..."
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          ></textarea>
          <button
            onClick={handle}
            className="inline-flex cursor-pointer justify-center rounded-full p-2 mt-4 text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
          >
            <svg
              className="h-5 w-5 rotate-90 rtl:-rotate-90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
            </svg>
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
