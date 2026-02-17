import React from "react";
import { Github, Code } from "lucide-react";
import { GitHubCalendar } from "react-github-calendar";

const CodingStats = ({ profileUser, loading }) => {
  if (loading) {
     return (
        <div className="w-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 h-[160px] animate-pulse"></div>
                <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 h-[160px] animate-pulse hidden xl:block"></div>
            </div>
        </div>
     );
  }

  if (
    !profileUser?.profile?.github_username &&
    !profileUser?.profile?.leetcode_username
  ) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* GitHub Calendar */}
        {profileUser.profile?.github_username && (
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 overflow-hidden flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Github size={16} />
                GitHub Activity
              </div>
              <a
                href={`https://github.com/${profileUser.profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00af9b] hover:underline"
              >
                @{profileUser.profile.github_username}
              </a>
            </div>
            <div className="flex justify-center transform scale-100 origin-center overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] **:[::-webkit-scrollbar]:hidden **:[scrollbar-width:none]">
              <GitHubCalendar
                username={profileUser.profile.github_username}
                colorScheme="dark"
                fontSize={10}
                blockSize={5.5}
                blockMargin={2}
                theme={{
                  dark: [
                    "#161b22",
                    "#0e4429",
                    "#006d32",
                    "#26a641",
                    "#39d353",
                  ],
                }}
              />
            </div>
          </div>
        )}

        {/* LeetCode Stats Card */}
        {profileUser.profile?.leetcode_username && (
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 flex flex-col relative overflow-hidden h-full justify-center">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Code size={16} className="text-orange-500" />
                LeetCode Stats
              </div>
              <a
                href={`https://leetcode.com/${profileUser.profile.leetcode_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-400 hover:underline"
              >
                @{profileUser.profile.leetcode_username}
              </a>
            </div>

            <div className="flex items-center justify-center relative z-10">
              <img
                src={`https://leetcard.jacoblin.cool/${profileUser.profile.leetcode_username}?theme=dark&font=Inter`}
                alt="LeetCode Stats"
                className="w-full h-auto max-h-32 object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CodingStats);
