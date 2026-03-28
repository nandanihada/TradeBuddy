import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeatureHighlightCardProps {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  description: string;
  buttonText: string;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

const imageContainerVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export const FeatureHighlightCard = React.forwardRef<
  HTMLDivElement,
  FeatureHighlightCardProps
>(({ imageSrc, imageAlt = "Feature image", title, description, buttonText, className }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-sm",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="absolute left-1/2 top-0 -z-10 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      <motion.div variants={imageContainerVariants} className="mb-6 flex justify-center">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-48 w-full object-cover rounded-xl"
        />
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-2xl font-bold tracking-tight text-card-foreground"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="mt-4 text-base text-muted-foreground"
      >
        {description}
      </motion.p>

      <motion.div variants={itemVariants} className="mt-8">
        <Button size="lg" className="w-full sm:w-auto">
          {buttonText}
        </Button>
      </motion.div>
    </motion.div>
  );
});

FeatureHighlightCard.displayName = "FeatureHighlightCard";
