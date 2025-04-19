"use client";
import { CommentReply } from "../../types/discussion";
import { format } from "date-fns";

export default function ReplyMessage(props: { reply: CommentReply }) {
  return (
    <div className="w-3/4 flex-col justify-self-center p-1 text-gray-100 ml-4">
      <div className="flex-col rounded bg-gray-300 p-3">
        <h2 className="bold text-gray-800">
          <strong>{props.reply.username}</strong> • {format(props.reply.timestamp, 'MMMM d, yyyy')}
        </h2>
        <h2 className="mt-2 text-black">{props.reply.message}</h2>
      </div>
    </div>
  );
}
