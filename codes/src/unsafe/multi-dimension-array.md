# 实现多维数组

```rust
// #~~~~~~~~~~~~~~~~#
// # Utility types/ #
// #   boilerplate  #
// #~~~~~~~~~~~~~~~~#

/// An integer half the width of a `usize`
#[derive(Clone, Copy)]
#[repr(transparent)]
struct Halfsize(
    #[cfg(target_pointer_width = "128")] u64,
    #[cfg(target_pointer_width = "64")] u32,
    #[cfg(target_pointer_width = "32")] u16,
    #[cfg(target_pointer_width = "16")] u8,
);

impl From<Halfsize> for usize {
    fn from(val: Halfsize) -> usize {
        match val.0.try_into() {
            Ok(val) => val,
            // SAFETY: A Halfsize can always fit into a usize.
            Err(_) => unsafe { std::hint::unreachable_unchecked() }
        }
    }
}

impl TryFrom<usize> for Halfsize {
    type Error = std::num::TryFromIntError;
    fn try_from(val: usize) -> Result<Halfsize, Self::Error> {
        val.try_into().map(Halfsize)
    }
}

impl std::ops::Mul for Halfsize {
    type Output = usize;
    fn mul(self, rhs: Self) -> usize {
        match usize::from(self).checked_mul(rhs.into()) {
            Some(val) => val,
            // SAFETY:
            //
            // Halfsize::MAX =  2^k - 1
            // usize::MAX    =  2^(2k) - 1
            //
            // Halfsize::MAX^2 = 2^(2k) - 2*2^k + 1 < usize::MAX
            // Thus, the product of any two Halfsizes can fit in a usize.
            None => unsafe { std::hint::unreachable_unchecked() },
        }
    }
}

/// Holds two values of the same type, with a guaranteed memory layout.
#[repr(C)]
struct Pair<T>(T, T);

impl From<usize> for Pair<Halfsize> {
    #[inline(always)]
    fn from(val: usize) -> Pair<Halfsize> {
        // SAFETY: Transmuting usize -> Pair<Halfsize> is sound, as Halfsize is
        // exactly half the width of a usize, Pair is repr(C), and any
        // bit pattern for Halfsize is valid.
        unsafe { std::mem::transmute(val) }
    }
}
impl From<Pair<Halfsize>> for usize {
    #[inline(always)]
    fn from(val: Pair<Halfsize>) -> usize {
        // SAFETY: Transmuting Pair<Halfsize> -> usize is sound, as Halfsize is
        // exactly half the width of a usize, Pair is repr(C), and any
        // bit pattern for usize is valid.
        unsafe { std::mem::transmute(val) }
    }
}

// #~~~~~~~~~~~~~~~~~~~~~~#
// # Some old matrix type #
// #~~~~~~~~~~~~~~~~~~~~~~#

/// An owned matrix.
pub struct Matrix<T> {
    items: Vec<T>,
    rows: Halfsize,
    cols: Halfsize,
}

impl<T> Matrix<T> {
    pub fn new(rows: usize, cols: usize) -> Self
    where
        T: Default,
    {
        let items: Vec<T> = (0..rows * cols).map(|_| Default::default()).collect();
        debug_assert_eq!(items.len(), rows * cols);

        Self {
            items,
            rows: rows.try_into().expect("`rows` must fit in half a usize"),
            cols: cols.try_into().expect("`cols` must fit in half a usize"),
        }
    }

    pub fn rows(&self) -> usize {
        self.rows.into()
    }
    pub fn cols(&self) -> usize {
        self.cols.into()
    }
}

// #~~~~~~~~~~~~~~~~~~~~~~~~~#
// # Where the magic happens #
// #~~~~~~~~~~~~~~~~~~~~~~~~~#

/// A reference to a matrix.
/// Dimensions are stored in the second field of the fat pointer.
#[repr(transparent)]
pub struct Mat<T>(std::marker::PhantomData<T>, [()]);

impl<T> Mat<T> {
    pub fn rows(&self) -> usize {
        // get from the second field of the fat pointer.
        let Pair(rows, _) = self.1.len().into();
        rows.into()
    }
    pub fn cols(&self) -> usize {
        // get from the second field of the fat pointer.
        let Pair(_, cols) = self.1.len().into();
        cols.into()
    }
    fn dim(&self) -> Pair<usize> {
        // get from the second field of the fat pointer.
        let Pair(rows, cols) = self.1.len().into();
        Pair(rows.into(), cols.into())
    }
}

impl<T> std::ops::Deref for Matrix<T> {
    type Target = Mat<T>;
    fn deref(&self) -> &Mat<T> {
        let ptr = self.items[..].as_ptr() as *const ();
        let dim = Pair(self.rows, self.cols).into();

        // SAFETY: Creating this slice is sound, as `from_raw_parts` requires
        // `ptr` to point to `dim` fully-initialized and aligned instances
        // of ().
        // () is a ZST, so it is fully initialized and aligned no matter what.
        let slice = unsafe { std::slice::from_raw_parts(ptr, dim) };

        // SAFETY: `Mat` is repr(transparent), so it's sound to transmute
        // from &[()] -> &Mat<T>.
        unsafe { std::mem::transmute(slice) }
    }
}

impl<T> std::ops::DerefMut for Matrix<T> {
    fn deref_mut(&mut self) -> &mut Mat<T> {
        let ptr = self.items[..].as_mut_ptr() as *mut ();
        let dim = Pair(self.rows, self.cols).into();

        // SAFETY: Creating this slice is sound, as `from_raw_parts` requires
        // `ptr` to point to `dim` fully-initialized and aligned instances
        // of ().
        // () is a ZST, so it is fully initialized and aligned no matter what.
        let slice = unsafe { std::slice::from_raw_parts_mut(ptr, dim) };

        // SAFETY: `Mat` is repr(transparent), so it's sound to transmute
        // from &mut [()] -> &mut Mat<T>.
        unsafe { std::mem::transmute(slice) }
    }
}

impl<T> std::borrow::Borrow<Mat<T>> for Matrix<T> {
    fn borrow(&self) -> &Mat<T> {
        &*self
    }
}

impl<T> std::borrow::ToOwned for Mat<T>
where
    T: Clone,
{
    type Owned = Matrix<T>;
    fn to_owned(&self) -> Matrix<T> {
        // fetch the first field of the fat pointer.
        let ptr = self.1.as_ptr() as *const T;
        // fetch the second field of the fat pointer.
        let Pair(rows, cols) = self.1.len().into();

        // SAFETY: A Mat can only be safely created from the `Deref` or
        // `DerefMut` impls, so we know that `ptr` must point to `rows * cols`
        // properly initialized values of T.
        let items = unsafe { std::slice::from_raw_parts(ptr, rows * cols) };
        let items = items.to_vec();

        Matrix { items, rows, cols }
    }
}

impl<T> std::ops::Index<[usize; 2]> for Mat<T> {
    type Output = T;
    fn index(&self, [i, j]: [usize; 2]) -> &T {
        let Pair(rows, cols) = self.dim();
        assert!(i < rows);
        assert!(j < cols);

        // SAFETY: A `&Mat` can only be safely created from the `Deref` or
        // `DerefMut` impls, so we know that `ptr` must point to `rows * cols`
        // properly initialized values of T.
        // Since `i` < `rows` and `j` < `cols`, we know that `i * cols + j`
        // must be less than `rows * cols`.
        unsafe {
            let ptr = self.1.as_ptr() as *const T;
            &*ptr.add(i * cols + j)
        }
    }
}
impl<T> std::ops::IndexMut<[usize; 2]> for Mat<T> {
    fn index_mut(&mut self, [i, j]: [usize; 2]) -> &mut T {
        let Pair(rows, cols) = self.dim();
        assert!(i < rows);
        assert!(j < cols);

        // SAFETY: A `&mut Mat` can only be safely created from the `DerefMut`
        // impl, so we know that `ptr` must point to `rows * cols` properly
        // initialized values of T.
        // Since `i` < `rows` and `j` < `cols`, we know that `i * cols + j`
        // must be less than `rows * cols`.
        unsafe {
            let ptr = self.1.as_mut_ptr() as *mut T;
            &mut *ptr.add(i * cols + j)
        }
    }
}

fn main() {
    let mut matrix = Matrix::new(3, 4);
    matrix[[0, 1]] = 1;
    matrix[[2, 2]] = 4;
    assert_eq!(matrix[[0, 1]], 1);

    let mat = &*matrix;
    assert_eq!(mat[[0, 1]], 1);
    assert_eq!(mat[[2, 2]], 4);

    let matrix2 = mat.to_owned();
    assert_eq!(matrix2[[0, 0]], 0);
    assert_eq!(matrix2[[0, 1]], 1);
    assert_eq!(matrix2[[2, 2]], 4);
}
```