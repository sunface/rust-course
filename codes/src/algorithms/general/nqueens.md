# N皇后算法

```rust
#[allow(unused_imports)]
use std::env::args;

#[allow(dead_code)]
fn main() {
    let mut board_width = 0;

    for arg in args() {
        board_width = match arg.parse() {
            Ok(x) => x,
            _ => 0,
        };

        if board_width != 0 {
            break;
        }
    }

    if board_width < 4 {
        println!(
            "Running algorithm with 8 as a default. Specify an alternative Chess board size for \
             N-Queens as a command line argument.\n"
        );
        board_width = 8;
    }

    let board = match nqueens(board_width) {
        Ok(success) => success,
        Err(err) => panic!("{}", err),
    };

    println!("N-Queens {} by {} board result:", board_width, board_width);
    print_board(&board);
}

/*
The n-Queens search is a backtracking algorithm. Each row of the Chess board where a Queen is
placed is dependent on all earlier rows. As only one Queen can fit per row, a one-dimensional
integer array is used to represent the Queen's offset on each row.
*/
pub fn nqueens(board_width: i64) -> Result<Vec<i64>, &'static str> {
    let mut board_rows = vec![0; board_width as usize];
    let mut conflict;
    let mut current_row = 0;

    //Process by row up to the current active row
    loop {
        conflict = false;

        //Column review of previous rows
        for review_index in 0..current_row {
            //Calculate the diagonals of earlier rows where a Queen would be a conflict
            let left = board_rows[review_index] - (current_row as i64 - review_index as i64);
            let right = board_rows[review_index] + (current_row as i64 - review_index as i64);

            if board_rows[current_row] == board_rows[review_index]
                || (left >= 0 && left == board_rows[current_row])
                || (right < board_width as i64 && right == board_rows[current_row])
            {
                conflict = true;
                break;
            }
        }

        match conflict {
            true => {
                board_rows[current_row] += 1;

                if current_row == 0 && board_rows[current_row] == board_width {
                    return Err("No solution exists for specificed board size.");
                }

                while board_rows[current_row] == board_width {
                    board_rows[current_row] = 0;

                    if current_row == 0 {
                        return Err("No solution exists for specificed board size.");
                    }

                    current_row -= 1;
                    board_rows[current_row] += 1;
                }
            }
            _ => {
                current_row += 1;

                if current_row as i64 == board_width {
                    break;
                }
            }
        }
    }

    Ok(board_rows)
}

fn print_board(board: &[i64]) {
    for row in 0..board.len() {
        print!("{}\t", board[row as usize]);

        for column in 0..board.len() as i64 {
            if board[row as usize] == column {
                print!("Q");
            } else {
                print!(".");
            }
        }
        println!();
    }
}

#[cfg(test)]
mod test {
    use super::*;

    fn check_board(board: &Vec<i64>) -> bool {
        for current_row in 0..board.len() {
            //Column review
            for review_index in 0..current_row {
                //Look for any conflict.
                let left = board[review_index] - (current_row as i64 - review_index as i64);
                let right = board[review_index] + (current_row as i64 - review_index as i64);

                if board[current_row] == board[review_index]
                    || (left >= 0 && left == board[current_row])
                    || (right < board.len() as i64 && right == board[current_row])
                {
                    return false;
                }
            }
        }
        true
    }

    #[test]
    fn test_board_size_4() {
        let board = nqueens(4).expect("Error propagated.");
        assert_eq!(board, vec![1, 3, 0, 2]);
        assert!(check_board(&board));
    }

    #[test]
    fn test_board_size_7() {
        let board = nqueens(7).expect("Error propagated.");
        assert_eq!(board, vec![0, 2, 4, 6, 1, 3, 5]);
        assert!(check_board(&board));
    }
}
```