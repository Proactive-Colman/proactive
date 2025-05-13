import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testService, Test } from "../services/testService";
import { message } from "antd";

export const useGetTests = () => {
    return useQuery({
        queryKey: ['tests'],
        queryFn: testService.getAllTests,
    });
}

export const useCreateTest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: testService.createTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            message.success('Test created successfully');
        },
        onError: () => {
            message.error('Failed to create test');
        },
    });
}

export const useUpdateTest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, test }: { id: number; test: Partial<Test> }) => 
            testService.updateTest(id, test),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            message.success('Test updated successfully');
        },
        onError: () => {
            message.error('Failed to update test');
        },
    });
}

export const useDeleteTest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: testService.deleteTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
            message.success('Test deleted successfully');
        },
        onError: () => {
            message.error('Failed to delete test');
        },
    });
}

