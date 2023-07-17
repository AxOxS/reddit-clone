import { Post, postState } from '@/atoms/postsAtom';
import { Box, Flex } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import CommentInput from './CommentInput';
import { Timestamp, collection, doc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { firestore } from '@/firebase/clientApp';
import { useSetRecoilState } from 'recoil';

type CommentsProps = {
    user: User;
    selectedPost: Post | null;
    communityId: string;
};

export type Comment = {
    id: string;
    creatorId: string;
    creatorDisplayText: string;
    communityId: string;
    postId: string;
    postTitle: string;
    text: string;
    createdAt: Timestamp;
}

const Comments: React.FC<CommentsProps> = ({
    user,
    selectedPost,
    communityId,
}) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const setPostState = useSetRecoilState(postState);

    const onCreateComment = async () => {

        setCreateLoading(true);
        try {
            const batch = writeBatch(firestore);
            const commentDocRef = doc(collection(firestore, 'comments'));

            const newComment: Comment = {
                id: commentDocRef.id,
                creatorId: user.uid,
                creatorDisplayText: user.email!.split('@')[0],
                communityId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text: commentText,
                createdAt: serverTimestamp() as Timestamp,
            };

            batch.set(commentDocRef, newComment);

            const postDocRef = doc(firestore, 'posts', selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfComments: increment(1),
            })

            await batch.commit();

            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! + 1
                } as Post
            }))
            setCommentText('');
            setComments((prev) => [newComment, ...prev]);

        } catch (error) {
            console.log('onCreateComment error', error);
        }
        setCreateLoading(false);
    };

    const onDeleteComment = async (comment: any) => {

    };

    const getPostComments = async () => {

    };

    useEffect(() => {
        getPostComments();
    }, [])

    return (
        <Box bg='white' borderRadius='0px 0px 4px 4px' p={2}>
            <Flex
                direction='column'
                pl={10}
                pr={4}
                mb={6}
                fontSize='10pt'
                width='100%'
            >
                <CommentInput
                    commentText={commentText}
                    setCommentText={setCommentText}
                    user={user}
                    createLoading={createLoading}
                    onCreateComment={onCreateComment}
                />
            </Flex>
        </Box>
    );
};
export default Comments;