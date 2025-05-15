"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  author: {
    name: string;
    image: string;
  };
  articleTitle: string;
  articleSlug: string;
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export default function LatestComments() {
  // Mock data for latest comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
      },
      articleTitle: "Apple Unveils New MacBook Pro with M3 Chip",
      articleSlug: "apple-unveils-new-macbook-pro-m3-chip",
      content: "This is an amazing article! I've been waiting for the M3 chip for so long, and it sounds like it's going to be a game changer for my video editing workflow.",
      createdAt: new Date().toISOString(),
      isApproved: true,
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
      },
      articleTitle: "Samsung Galaxy S23 Ultra Review",
      articleSlug: "samsung-galaxy-s23-ultra-review",
      content: "I'm skeptical about the battery life claims. Samsung always overpromises on battery performance. Has anyone done independent testing yet?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isApproved: true,
    },
    {
      id: "3",
      author: {
        name: "David Kim",
        image: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      articleTitle: "NVIDIA Announces RTX 5090",
      articleSlug: "nvidia-announces-rtx-5090",
      content: "Does anyone know if the thermal redesign actually makes a difference during sustained workloads? My RTX 4090 still throttles after a few minutes of heavy rendering.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isApproved: false,
    },
  ]);

  const approveComment = (id: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === id ? { ...comment, isApproved: true } : comment
      )
    );
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div 
            key={comment.id} 
            className={`p-4 border rounded-lg ${
              comment.isApproved 
                ? "border-gray-200 dark:border-gray-700" 
                : "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <Image
                src={comment.author.image}
                alt={comment.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <Link 
                  href={`/articles/${comment.articleSlug}`} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
                >
                  Re: {comment.articleTitle}
                </Link>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {comment.content}
                </p>
                
                <div className="mt-2 flex justify-end space-x-2">
                  {!comment.isApproved && (
                    <button
                      onClick={() => approveComment(comment.id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No comments found
        </div>
      )}
      
      <div className="text-center mt-4">
        <Link
          href="/admin/comments"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
        >
          View all comments
        </Link>
      </div>
    </div>
  );
}
