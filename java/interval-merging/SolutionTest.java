import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class SolutionTest {

    private static int[][] toArray(List<int[]> intervals) {
        return intervals.toArray(new int[0][]);
    }

    @Test
    void mergesOverlappingIntervals() {
        List<int[]> merged = Solution.merge(List.of(new int[] {1, 3}, new int[] {2, 6}, new int[] {8, 10}));

        assertArrayEquals(new int[][] {{1, 6}, {8, 10}}, toArray(merged));
    }

    @Test
    void mergesUnsortedInput() {
        List<int[]> merged = Solution.merge(List.of(new int[] {8, 10}, new int[] {1, 3}, new int[] {2, 6}));

        assertArrayEquals(new int[][] {{1, 6}, {8, 10}}, toArray(merged));
    }

    @Test
    void mergesTouchingIntervals() {
        List<int[]> merged = Solution.merge(List.of(new int[] {1, 3}, new int[] {3, 5}));

        assertArrayEquals(new int[][] {{1, 5}}, toArray(merged));
    }

    @Test
    void returnsEmptyForEmptyInput() {
        assertTrue(Solution.merge(new ArrayList<>()).isEmpty());
    }

    @Test
    void leavesTheInputUnchanged() {
        List<int[]> input = new ArrayList<>(List.of(new int[] {5, 7}, new int[] {1, 2}));

        Solution.merge(input);

        assertArrayEquals(new int[][] {{5, 7}, {1, 2}}, toArray(input));
    }

    @Test
    void sumsTheCoveredLength() {
        assertEquals(5, Solution.coveredLength(List.of(new int[] {1, 3}, new int[] {2, 6})));
        assertEquals(4, Solution.coveredLength(List.of(new int[] {0, 2}, new int[] {10, 12})));
    }
}
