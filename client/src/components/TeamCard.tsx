import type { TeamMember } from "@shared/schema";
import { Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

interface TeamCardProps {
  member: TeamMember;
  index?: number;
  clickable?: boolean;
  showBio?: boolean;
  showTitle?: boolean;
}

export function TeamCard({ member, index = 0, clickable = true, showBio = true, showTitle = true }: TeamCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  
  const imageUrl = member.imageUrl || null;

  const cardContent = (
    <div className="relative overflow-visible rounded-lg bg-card border border-border h-full flex flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg flex items-center justify-center bg-muted">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage width={400} height={400}
            src={imageUrl || ""}
            alt={member.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <AvatarFallback className="w-full h-full rounded-none text-4xl">
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3
          className="font-semibold text-lg text-foreground"
          data-testid={`text-name-${member.id}`}
        >
          {member.name}
        </h3>
        {showTitle && member.title && (
          <p
            className="text-sm text-muted-foreground mt-1"
            data-testid={`text-title-${member.id}`}
          >
            {member.title}
          </p>
        )}
        {showBio && member.bio && (
          <p
            className="text-sm text-muted-foreground mt-3 line-clamp-2"
            data-testid={`text-bio-${member.id}`}
          >
            {member.bio}
          </p>
        )}
        {clickable && (
          <p className="text-xs text-accent mt-auto pt-3">Click to view more</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group h-full ${clickable ? 'cursor-pointer' : ''}`}
        onClick={clickable ? () => setIsOpen(true) : undefined}
        data-testid={`card-team-${member.id}`}
      >
        {cardContent}
      </motion.div>

      {clickable && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 rounded-lg">
                  <AvatarImage
                    src={imageUrl || ""}
                    alt={member.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl rounded-lg">
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">{member.name}</DialogTitle>
                  {member.title && (
                    <DialogDescription className="mt-1">
                      {member.title}
                    </DialogDescription>
                  )}
                </div>
              </div>
            </DialogHeader>
            {member.bio && (
              <p className="text-muted-foreground mt-4 leading-relaxed" data-testid={`text-bio-dialog-${member.id}`}>
                {member.bio}
              </p>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-accent hover:underline text-sm"
                data-testid={`link-linkedin-dialog-${member.id}`}
              >
                <Linkedin className="w-4 h-4" />
                <span>View LinkedIn Profile</span>
              </a>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
